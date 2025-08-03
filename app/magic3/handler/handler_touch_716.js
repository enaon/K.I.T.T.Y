ew.def.touchtype = "716";
//ew.def.rstR=0xA5; 
ew.sys.TC = {
	dbg: 0,
	tid: 0,
	tim: 0,
	x: 0,
	y: 0,
	do: 0,
	st: 1,
	bt: 1,
	rp: 0,
	loop: 25,
	val: { cur: 0, up: 0, dn: 0 },
	slide: function(cur, up, dn) {
		let step = Math.round(200 / (up - dn));
	},
	init: function() {
		//"jit";
		var tp = i2c.readFrom(0x15, 7);
		if (tp == Uint8Array(7) || (tp[3] == 64 && this.st)) return;
		if (this.dbg) console.log("TC dbg: tp,this.st :",tp,this.st);

		if (ew.temp.bar) {
			if (180 < (((tp[5] & 0x0F) << 8) | tp[6])) {
				if (this.dbg) print("TC dbg: touch input in bar:", tp);

				if (tp[2]) {
					if (this.st) {
						this.st = 0;
						this.y = ((tp[5] & 0x0F) << 8) | tp[6];
						this.x = tp[4];
						return;
					}
					if (this.x != tp[4]) {
						this.bt = 0;
						this.rp = 0;
						if (this.tim) {
							clearTimeout(this.tim);
							this.tim = 0
						};
						if (this.val.reverce) this.val.tmp = this.x > tp[4] ? this.val.tmp - (tp[4] - this.x) : this.val.tmp + (this.x - tp[4]);
						else this.val.tmp = this.x < tp[4] ? this.val.tmp + (tp[4] - this.x) : this.val.tmp - (this.x - tp[4]);
						let len = 15;
						//let step = Math.round(this.val.tmp / len);
						let step = this.val.tmp / len | 0;
						if (step == 1) step = 0;
						else if (step == -1) step = 0;
						else if (step == 2 || step == 3) step = 1;
						else if (step == -2 || step == -3) step = -1;
						else if (step) step = step * 1.8 | 0;
						//else if (step) step = Math.round(step * 1.8);
						if (step) {
							if (len < this.val.tmp || this.val.tmp < -len) {
								this.val.cur = this.val.cur + step;
								this.val.tmp = 0;
							}
							if (this.val.up < this.val.cur) this.val.cur = (this.val.loop) ? this.val.dn : this.val.up;
							else if (this.val.cur < this.val.dn) this.val.cur = (this.val.loop) ? this.val.up : this.val.dn;
							if (!this.val.tmp) {
								ew.sys.buzz.nav(10);
								ew.UI.nav.bar( this.x < tp[4] ? 1 : -1, this.val.cur );
								//this.emit("bar", this.x < tp[4] ? 1 : -1, this.val.cur);
							}
						}
						this.x = tp[4];
					}
					else {
						this.bt = 1;
						if (!this.tim) this.tim = setTimeout(() => {
							this.rp = 1;
							this.tim = 0;
						}, 300)
						if (this.rp) {
							ew.sys.buzz.nav(10);
							this.bt = 0;
							let side = (g.getWidth() / 2 < tp[4]) ? 1 : 0;
							if (this.val.reverce) side = 1 - side;
							side ? this.val.cur++ : this.val.cur--;
							if (this.val.up < this.val.cur) this.val.cur = (this.val.loop) ? this.val.dn : this.val.up;
							else if (this.val.cur < this.val.dn) this.val.cur = (this.val.loop) ? this.val.up : this.val.dn;
							ew.UI.nav.bar( side ? 1 : -1, this.val.cur );
							//this.emit("bar", side ? 1 : -1, this.val.cur);
						}
					}
				}
				else {
					this.st = 1;
					this.rp = 0;
					if (this.tim) {
						clearTimeout(this.tim);
						this.tim = 0
					};
					if (this.bt) {
						this.bt = 0;
						ew.sys.buzz.nav(ew.sys.buzz.type.ok)
						let side = (g.getWidth() / 2 < tp[4]) ? 1 : 0;
						if (this.val.reverce) side = 1 - side;
						side ? this.val.cur++ : this.val.cur--;
						if (this.val.up < this.val.cur) this.val.cur = (this.val.loop) ? this.val.dn : this.val.up;
						else if (this.val.cur < this.val.dn) this.val.cur = (this.val.loop) ? this.val.up : this.val.dn;
						//this.emit("bar", side ? 1 : -1, this.val.cur);
						ew.UI.nav.bar( side ? 1 : -1, this.val.cur );
					}
					ew.face.off();
				}
				if (this.dbg) console.log("TC dbg: in bar return, tp:", tp);
				return;
			} // else if (!this.do) this.st = 1;

		}
		else if (this.do) this.st = 0;
		if (tp[3] === 0 || tp[3] === 128) {
			if (this.dbg) print("TC dbg: touch input in main:", tp);
			if (tp[2] == 1 && this.st) {
				//print("start",this.do,this.st, tp)
				this.st = 0;
				this.do = 1;
				this.aLast = -1;
				//this.x = ((tp[3] & 0x0F) << 8) | tp[4];
				this.x = tp[4];
				this.y = ((tp[5] & 0x0F) << 8) | tp[6];
				this.time = getTime();
				return;
			}
			if (this.do && getTime() - this.time > 1 && tp[2] == 1) {
				//print("hold",this.do,this.st, tp)
				this.do = 0;
				ew.UI.c.xy(this.x + (this.x / 10), this.y, 1);
				ew.face.off();
			}
			else if (this.do && tp[2] == 1) {
				var a = 0;
				if ((((tp[5] & 0x0F) << 8) | tp[6]) >= this.y + 30) a = 1;
				else if ((((tp[5] & 0x0F) << 8) | tp[6]) <= this.y - 30) a = 2;
				else if ((((tp[3] & 0x0F) << 8) | tp[4]) <= this.x - 20) a = 3;
				else if ((((tp[3] & 0x0F) << 8) | tp[4]) >= this.x + 20) a = 4;
				//print(a,this.aLast)
				if (a != 0 && this.aLast != a) {
					if (this.dbg) console.log("TC dbg: in main, gesture:", a);
					this.aLast = a;
					this.do = 0;
					//this.st=0;
					//print("tap/swipe",a,this.do,this.st, tp);
					ew.face.off();
					const  dir=['na','dn','up','next','back'];
					ew.UI.nav[dir[a]]( this.x + (this.x / 10), this.y );
					//this.emit("tc" + a, this.x + (this.x / 10), this.y);
				}
				return;
			}
		}
		else if (tp[3] == 64 && !this.st) {
			//print("end",this.do,this.st, tp)
			if (this.do === 1) {
				this.do = 0;
				ew.face.off();
				if (ew.UI.ntid && !ew.is.bar && (180 < (((tp[5] & 0x0F) << 8) | tp[6]))) { ew.sys.buzz.nav(ew.sys.buzz.type.ok);ew.UI.rtb(); return; }
				ew.UI.c.xy(this.x + (this.x / 10), this.y);
			}
			this.aLast = 0;
			this.st = 1;
			this.time = 0;
		}
	},
	start: function() {
		//	"ram";
		if (this.tid) clearInterval(this.tid);
		digitalPulse(ew.def.rstP, 1, [10, 100]); //touch wake
		i2c.writeTo(0x15, 0);
		this.st = 1;
		this.tid = setInterval(function() {
			ew.sys.TC.init();
		}, this.loop);
	},
	stop: function() {
		//"ram";
		if (this.tid) clearInterval(this.tid);
		this.tid = 0;
		digitalPulse(ew.def.rstP, 1, [5, 50]);
		setTimeout(() => { i2c.writeTo(0x15, ew.def.rstR, 3); }, 100);
		this.aLast = 0;
		this.st = 1;
		this.time = 0;
	}
};
