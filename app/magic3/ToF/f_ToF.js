//ToF
ew.UI.nav.next.replaceWith(() => {
	ew.sys.buzz.nav(ew.sys.buzz.type.na);
});
ew.UI.nav.back.replaceWith(() => {
	ew.sys.buzz.nav(ew.sys.buzz.type.ok);
	ew.face.go("main", 0);
});
//
ew.face[0] = {
	offms: (ew.def.off[ew.face.appCurr]) ? ew.def.off[ew.face.appCurr] : 60000,
	init: function() {
		this.tof=ew.apps.ToF.read();
		if (this.tof== 6553.5 ) { ew.apps.kitty.call.wake();}
		g.clear();
		g.setCol(0, 15);
		g.setFont("Vector", 20);
		g.drawString("ToF SENSOR", 120- g.stringWidth("ToF SENSOR")/2, 5);  
  		this.bar();
  		this.tof_f=-1;
		this.run = 1;
	},
	show: function() {
		if (!this.run) return;
		this.tof=ew.apps.ToF.read();
		this.ele.tof();
		g.flip();
		this.tid = setTimeout(function(t, o) {
			t.tid = -1;
			t.show();
		}, 500, this);
	},
	bar: function() {
		if (ew.is.UIpri) { ew.notify.alert("error",ew.notify.log.error[0], 1, 1);return;}
		ew.temp.bar = 0;
		ew.UI.c.start(1, 1);
		ew.UI.btn.c2l("bar","_bar",4,"SET","FULL",15,6);
		ew.UI.btn.c2l("bar","_bar",5,"SET","EMPTY",15,1);
		ew.UI.c.end();
		ew.UI.c.bar._bar = (i,l) => {
			if (!l) {ew.sys.buzz.nav(ew.sys.buzz.type.na);ew.UI.btn.ntfy(1,3,0,"_bar",6,"PLEASE USE","LONG PRESS",15,13);return;}
			if (i == 4) {
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				ew.UI.btn.ntfy(1,3,0,"_bar",6,"FULL LEVEL","SET",15,13);
				ew.apps.kitty.state.def.tof.full=this.tof;
			}
			else if (i==5){
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				ew.UI.btn.ntfy(1,3,0,"_bar",6,"EMPTY LEVEL","SET",15,13);
				ew.apps.kitty.state.def.tof.empty=this.tof;
			}
		};
	},
	ele: {
		g: g,
		tof: function() {
			if (ew.face[0].tof_f != ew.face[0].tof) {
				ew.face[0].tof_f = ew.face[0].tof;
				g.setCol(0, 15);
				g.fillRect({ x: 0, y: 70, x2: 240, y2: 175, r: 10 });

				if (ew.face[0].tof_f == 6553.5 ) {
					g.setCol(1, 13);
					g.setFont("LECO1976Regular22", 3);
					g.drawString("WAIT", 120 - g.stringWidth("WAIT") / 2, 100);
				}
				else {
					g.setCol(1, 0);
					g.setFont("Vector", 25);
					g.drawString("cm", 200, 125); //litter
					g.setCol(1, 4);
					g.setFont("LECO1976Regular22", 3);
					g.drawString(ew.face[0].tof_f.toFixed(1), 110 - g.stringWidth(ew.face[0].tof_f.toFixed(1)) / 2, 100);
				}

			}
		}
	},
	tid: -1,
	run: false,
	clear: function() {
		ew.temp.bar = 0; /*TC.removeAllListeners();*/
		if (this.tid) clearTimeout(this.tid);
		this.tid = 0;
		return true;
	},
	off: function() {
		g.off();
		this.clear();
	}
};
