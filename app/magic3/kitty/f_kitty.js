//scat-a 
ew.UI.nav.next.replaceWith(() => {
	ew.sys.buzz.nav(ew.sys.buzz.type.ok);
	if (!ew.apps.kitty.state.def.is.scale) {
		ew.UI.btn.ntfy(1, 5, 0, "_bar", 6, "SCALE IS DISABLED", "", 13, 15);
		return;
	}
	ew.face.go('scale', 0);
});
ew.UI.nav.back.replaceWith(() => {
	ew.sys.buzz.nav(ew.sys.buzz.type.na);
});
//
ew.face[0] = {
	offms: (ew.def.off[ew.face.appCurr]) ? ew.def.off[ew.face.appCurr] : 60000,
	init: function() {
		//turn off scale if not needed
		if (!ew.apps.kitty.state.def.is.scale) ew.apps.scale.stop();
		//g.clear();
		this.tab = 1;
		this.cache = { litter: -1, waste: -1, pause: 0, page: 0, };
		this.pageSelect();
		g.setCol(0, 0);
		g.fillRect({ x: 0, y: 0, x2: 240, y2: 40, });
		this.run = 1;
		this.bar();
	},
	show: function() {
		if (!this.run) return;
		this.ele.ind_power();
		this.ele.ind_auto();
		this.ele.ind_bt();
		this.ele.ind_vibrator();
		this.ele.ind_counter();
		this.pageSelect();
		if (this.cache.page == 1) {
			this.ele.litter();
			this.ele.waste();
		}
		if (this.cache.page == 3) {

			g.setCol(0, 6);
			g.fillRect({ x: 0, y: 70, x2: 240, y2: 175, r: 10 });
			g.setCol(1, 15);
			g.setFont("LECO1976Regular22", 3);

			let w = ((ew.apps.kitty.state.is.scale.grams - this.baseW) / 1000).toFixed(3);
			if (w <= ew.apps.scale.state.value.tolerance / 1000) {
				g.setFont("LECO1976Regular22", 2);
				g.drawString("GONE", 120 - g.stringWidth("GONE") / 2, 110);
			}
			else {
				g.drawString(w, 110 - g.stringWidth(w) / 2, 100); //litter

				g.setFont("Vector", 20);
				g.drawString("Kg", 210, 130); //unit
			}

			if (ew.apps.scale.state.value.counter.event == 8) 
				ew.UI.btn.ntfy(1, 5, 0, "_bar", 6, "HELLO KITTY", "", 15, 6);

		}
		else if (this.cache.pause != ew.apps.kitty.state.is.sys.pause) {
			this.cache.pause = ew.apps.kitty.state.is.sys.pause;
			ew.UI.btn.c2l("main", "_3x1", 2, ew.apps.kitty.state.is.sys.pause ? "RESUME" : "PAUSE", "", 15, ew.apps.kitty.state.is.sys.pause ? 6 : 1, 1.3);
		}
		//if (!this.barL)
		//	this.bar()
		//else 
		g.flip();


		this.tid = setTimeout(function(t, o) {
			t.tid = -1;
			t.show();
		}, 350, this);
	},
	pageSelect: function() {
		//once
		//if (ew.apps.scale.state.value.counter.event) {
		if (this.cache.page != 3 && ew.apps.scale.state.is.status === "event" && !ew.apps.kitty.state.is.sys.busy) {
			if (!this.timer) {
				this.ele.page3("start");
				//this.bar();
			}
		}
		else if (this.cache.page != 1 && ew.apps.scale.state.is.status != "event" && !ew.apps.kitty.state.is.sys.busy) {
			this.cache.litter = -1;
			this.cache.waste = -1;
			if (ew.face[0].timer) {
				clearTimeout(ew.face[0].timer);
				ew.face[0].timer = 0
			}
			this.ele.page1();
			//this.bar();

		}
		else if (this.cache.page != 2 && ew.apps.kitty.state.is.sys.busy) {
			this.cache.pause = -1;
			this.ele.page2();
			//this.bar();
		}


	},
	bar: function(page) {
		if (ew.is.UIpri) { ew.notify.alert("error",ew.notify.log.error[0], 1, 1);return;}
		this.barL = 1;
		ew.temp.bar = 0;
		ew.UI.ele.fill("_bar", 6, 0);
		ew.UI.c.start(0, 1);
		//if (this.cache.page == 1 || this.cache.page == 3) {
		this.ele.today();
		this.ele.battery();
		ew.UI.ele.coord("bar", "_bar", 4);
		ew.UI.ele.coord("bar", "_bar", 5);
		ew.UI.c.bar._bar = (i, l) => {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			if (i == 4) {
				if (l) {
					if (ew.logger.kitty.getStats("activity").length == 0) ew.notify.alert("info", { body: "", title: "NO ACTIVITY YET" }, 0, 0);
					else
						ew.face.go('view_activity', 0, { source: "activity", name: "TODAY", key: "gr", key_2: "sec", key_3: "time", key_4: "clean", lowL: "0", hiL: "10000", style: 1, loop: 0 });
				}
				else {
					if (Object.keys(ew.logger.kitty.getStats("year")).length == 0) ew.notify.alert("info", { body: "", title: "NO LOGS YET" }, 0, 0);
					else
						ew.face.go('view_cycles', 0, { source: "month", style: 1, loop: 1 });
				}
			}
			else if (i == 5) {
				if (!ew.logger.battery) ew.notify.alert("info", { body: "NOT INSTALLED", title: "BATTERY LOGGER" }, 0, 0);
				else ew.face.go('view_battery', 0, { style: 1, loop: 1 });
			}
		};
		ew.UI.c.end();
	},
	ele: {
		timer: 0,
		page1: function() {
			ew.face[0].cache.page = 1;
			ew.UI.ele.fill("_main", 9, 0);
			this.litter();
			this.waste();
			ew.UI.c.start(1, 0);
			ew.UI.ele.coord("main", "_main", 4);
			ew.UI.c.end();
			ew.UI.c.main._main = (i) => {
				if (i == 4) {
					ew.sys.buzz.nav(ew.sys.buzz.type.ok);
					if (!ew.apps.kitty.state.def.is.scale) {
						ew.UI.btn.ntfy(1, 5, 0, "_bar", 6, "SCALE IS DISABLED", "", 13, 15);
						return;
					}
					ew.face.go('scale', 0);
				}
			};
		},
		page2: function() {
			ew.face[0].cache.page = 2;
			ew.UI.ele.fill("_main", 9, 0);
			ew.UI.c.start(1, 0);
			ew.UI.btn.c2l("main", "_3x1", 1, ew.apps.kitty.state.is.sys.abort ? "ABORTING" : "ABORT", "", 15, ew.apps.kitty.state.is.sys.abort ? 6 : 13, 1.3);
			ew.UI.btn.c2l("main", "_3x1", 2, ew.apps.kitty.state.is.sys.pause ? "RESUME" : "PAUSE", "", 15, ew.apps.kitty.state.is.sys.pause ? 6 : 1, 1.3);
			ew.UI.c.end();
			ew.UI.c.main._3x1 = (i) => {
				if (i == 1) {
					ew.sys.buzz.nav(ew.sys.buzz.type.ok);
					//if (ew.apps.kitty.state.is.sys.abort) 
					ew.apps.kitty.state.is.sys.abort = 1;
					ew.UI.btn.c2l("main", "_3x1", 1, ew.apps.kitty.state.is.sys.abort ? "ABORTING" : "ABORT", "", 15, ew.apps.kitty.state.is.sys.abort ? 6 : 13, 1.3);
				}
				else if (i == 2) {
					ew.sys.buzz.nav(ew.sys.buzz.type.ok);
					ew.UI.btn.c2l("main", "_3x1", 2, ew.apps.kitty.state.is.sys.pause ? "PAUSE" : "RESUME", "", 15, ew.apps.kitty.state.is.sys.pause ? 1 : 6, 1.3);
					ew.sys.emit('button', 'long');
				}
			};
		},
		page3: function(i) {
			ew.face[0].cache.page = 3;
			ew.face[0].baseW = (ew.apps.scale.state.log.average(ew.apps.scale.state.log.idle) | 0);
			ew.UI.ele.fill("_main", 9, 0);
			g.setCol(1, 15);
			g.setFont("Vector", ew.apps.kitty.state.is.scale.alert ? 13 : 14);
			g.drawString("CAT'S WEIGHT", 120 - g.stringWidth("CAT'S WEIGHT") / 2, 45); //litter
		},
		litter: function() {
			if (ew.face[0].cache.litter != ew.apps.kitty.state.is.scale.grams) {
				ew.face[0].cache.litter = ew.apps.kitty.state.is.scale.grams;

				// ---- bg main ----
				g.setCol(0, 6);
				g.fillRect({ x: 0, y: 70, x2: 120, y2: 175, r: 10 });
				// ---- bg label ----
				g.setCol(0, 1 <= ew.apps.kitty.state.is.scale.alert ? 13 : 0);
				g.fillRect({ x: 25, y: 40, x2: 100, y2: 60, r: 10 });
				// ---- fg label ----
				g.setCol(1, 1 <= ew.apps.kitty.state.is.scale.alert ? 15 : 2);
				g.setFont("Vector", ew.apps.kitty.state.is.scale.alert ? 13 : 14);
				g.drawString(ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].name.toUpperCase(), 65 - g.stringWidth(ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].name.toUpperCase()) / 2, 45); //litter
				// ---- fg main ----
				g.setCol(0, 15);
				g.setFont("LECO1976Regular22", 3);
				if (100 <= ew.apps.kitty.state.is.scale.per) {
					g.setFont("Vector", 18);
					g.drawString("OVERLOAD", 60 - g.stringWidth("OVERLOAD") / 2, 80); //litter
					g.setFont("LECO1976Regular22", 2);
					g.drawString(ew.apps.kitty.state.is.scale.grams - ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max - ew.apps.scale.state.def.ball, 60 - g.stringWidth(ew.apps.kitty.state.is.scale.grams - ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max - ew.apps.scale.state.def.ball) / 2, 110); //litter
					g.setFont("Vector", 16);
					g.drawString("GRAMS", 60 - g.stringWidth("GRAMS") / 2, 155); //litter
				}
				else {
					g.drawString(ew.apps.kitty.state.is.scale.per, 60 - g.stringWidth(ew.apps.kitty.state.is.scale.per) / 2, 100); //litter
					// ---- fg unit ----
					g.setCol(1, 14);
					g.setFont("Vector", 20);
					g.drawString("%", 103, 130); //litter
				}
			}
		},
		waste: function() {
			if (ew.face[0].cache.waste != ew.apps.kitty.state.is.tof.per) {
				ew.face[0].cache.waste = ew.apps.kitty.state.is.tof.per;
				g.setCol(0, 6);
				g.fillRect({ x: 120, y: 70, x2: 238, y2: 175, r: 10 });
				g.setCol(1, 2);
				g.setFont("Vector", 14);
				g.drawString("WASTE", 155, 45); //waste
				g.setFont("Vector", 20);
				g.setCol(1, 14);
				g.drawString("%", 222, 130); //waste
				g.setFont("LECO1976Regular22", 3);
				g.setCol(1, 15);
				//g.setCol(1, 80 <= ew.face[0].cache.waste ? 13 : 4);
				g.drawString(0 <= ew.apps.kitty.state.is.tof.per ? ew.apps.kitty.state.is.tof.per : 0, 180 - g.stringWidth(0 <= ew.apps.kitty.state.is.tof.per ? ew.apps.kitty.state.is.tof.per : 0) / 2, 100); //waste
			}
		},
		today: function() {
			g.setCol(1, 2);
			g.setFont("Vector", 14);
			g.drawString("TODAY", 35, 200);
			g.setFont("LECO1976Regular22", 2);
			g.setCol(1, 15);
			let today = ew.logger.kitty ? ew.logger.kitty.getStats("day", "total") : ew.apps.kitty.state.is.sys.run;
			g.drawString(today, 60 - g.stringWidth(today) / 2, 230); //today 
		},
		battery: function() {
			g.setCol(1, 2);
			g.setFont("Vector", 14);
			g.drawString("BATTERY", 147, 200);
			g.drawString("%", 222, 250);
			g.setFont("LECO1976Regular22", 2);
			g.setCol(1, 15);
			g.drawString(ew.is.batS, 180 - g.stringWidth(ew.is.batS) / 2, 230); //battery
		},
		ind_power: function() {
			let p = ew.pin.CHRG.read();
			if (ew.face[0].cache.ind_power != p) {
				ew.face[0].cache.ind_power = p;
				g.setCol(1, ew.face[0].cache.ind_power ? 1 : 14);
				g.drawImage(require("heatshrink").decompress(atob(ew_icon.bri)), 180, 15, { scale: 0.95, rotate: Math.PI / 2 });
			}
		},
		ind_auto: function() {
			let p = ew.apps.kitty.state.def.auto.clean;
			let p1 = ew.apps.kitty.state.is.sys.busy;
			if (ew.face[0].cache.ind_auto != p || ew.face[0].cache.ind_auto1 != p1) {
				ew.face[0].cache.ind_auto = p;
				ew.face[0].cache.ind_auto1 = p1;
				g.setCol(1, p1 ? 7 : p ? 14 : 1);
				g.drawImage(require("heatshrink").decompress(atob(ew_icon.wakeScreen)), 30, 0, { scale: 0.5 });
			}
		},
		ind_bt: function() {
			let p = ew.is.bt;
			if (ew.face[0].cache.ind_bt != p) {
				ew.face[0].cache.ind_bt = p;
				g.setCol(1, p ? 14 : 1);
				g.drawImage(require("heatshrink").decompress(atob(ew_icon.bt)), 200, 4, { scale: 0.35 });
			}
		},
		ind_vibrator: function() {
			let p = ew.apps.kitty.state.is.vibrator.connected ? 1 : 0;
			let p1 = ew.apps.kitty.vibrator.active;
			if (ew.face[0].cache.ind_vibrator != p || ew.face[0].cache.ind_vibrator1 != p1) {
				ew.face[0].cache.ind_vibrator = p;
				ew.face[0].cache.ind_vibrator1 = p1;
				g.setCol(1, p1 ? 7 : p ? 14 : 1);
				g.drawImage(require("heatshrink").decompress(atob(ew_icon.vibration)), 138, 2, { scale: 0.35 });
			}
		},
		ind_counter: function() {
			let p = ew.apps.scale.state.value.counter.still;
			let p1 = ew.apps.scale.state.value.counter.clean;
			let p2 = ew.apps.scale.state.is.status;
			//g.setFont("Vector", 15);
			if (ew.apps.scale.state.value.counter.still) {
				if (ew.face[0].cache.ind_idleCounter != p) {
					ew.face[0].cache.ind_idleCounter = p;
					g.setCol(0, 0);
					g.fillRect({ x: 60, y: 0, x2: 125, y2: 20, });
					if (p) {
						// reset status
						ew.face[0].cache.ind_counterStatus = "0";
						//
						g.setCol(1, 7);
						g.setFont("Vector", 19);
						g.drawString(ew.apps.scale.state.value.event.stillTimeout - p, 90 - g.stringWidth(ew.apps.scale.state.value.event.stillTimeout - p) / 2, 4); //
					}
				}
			}
			else if (p1 && ew.face[0].cache.ind_counter != p1 && ew.apps.scale.state.is.status == "idle") {
				ew.face[0].cache.ind_counter = p1;
				g.setCol(0, 0);
				g.fillRect({ x: 60, y: 0, x2: 125, y2: 20, });
				if (p1) {
					ew.face[0].cache.ind_counterStatus = "idle";
					g.setCol(1, 14);
					g.setFont("Vector", 19);
					//g.setFont("LECO1976Regular22");
					g.drawString(p1, 90 - g.stringWidth(p1) / 2, 4); //
				}
			}
			else if (ew.face[0].cache.ind_counterStatus != p2 && !ew.apps.scale.state.value.counter.still) {
				ew.face[0].cache.ind_counterStatus = p2;
				g.setCol(0, 0);
				g.fillRect({ x: 60, y: 0, x2: 125, y2: 20, });
				if (ew.apps.kitty.state.def.is.scale) {
					g.setCol(1, 11);
					g.setFont("Vector", 15);
					g.drawString(p2.toUpperCase(), 90 - g.stringWidth(p2.toUpperCase()) / 2, 6); //
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
		if (ew.face[0].timer) {
			clearTimeout(ew.face[0].timer);
			ew.face[0].timer = 0;
		}
		this.barL = 0;
		return true;
	},
	off: function() {
		g.off();
		this.clear();
	}
};
