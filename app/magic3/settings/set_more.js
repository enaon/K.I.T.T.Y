ew.UI.nav.next.replaceWith((x, y) => {
	if (ew.face[0].page == "more3") { ew.sys.buzz.nav(ew.sys.buzz.type.na); return; }
	ew.sys.buzz.nav(ew.sys.buzz.type.ok);
	if (ew.face[0].page == "more1")
		ew.face[0].d2();
	else ew.face[0].d3();
	if (ew.UI.ntid) {
		clearTimeout(ew.UI.ntid);
		ew.UI.ntid = 0;
		ew.face[0].bar();
	}
});
ew.UI.nav.back.replaceWith((x, y) => {
	if (ew.face[0].page == "more1") {
		ew.sys.buzz.nav(ew.sys.buzz.type.ok);
		eval(require("Storage").read("ew_f_set_dash"));
		if (ew.UI.ntid) {
			clearTimeout(ew.UI.ntid);
			ew.UI.ntid = 0;
		}
		ew.face[0].bar();
		return;
	}
	ew.sys.buzz.nav(ew.sys.buzz.type.ok);
	if (ew.face[0].page == "more3")
		ew.face[0].d2();
	else
		ew.face[0].d1();
	if (ew.UI.ntid) {
		clearTimeout(ew.UI.ntid);
		ew.UI.ntid = 0;
	}
	ew.face[0].bar();
});
//
ew.face[0].page = "more1";

ew.face[0].d1 = function() {
	ew.face[0].page = "more1";
	//lid = 1;
	ew.UI.c.start(1, 0);
	ew.UI.ele.ind(1, 3, 0);
	ew.UI.ele.fill("_main", 9, 0);
	ew.UI.btn.c2l("main", "_2x3", 1, "VIB", (ew.apps.kitty.state.def.is.vibrator && ew.apps.kitty.state.is.vibrator.connected) ? ew.apps.kitty.state.is.vibrator.battery : "", 15, ew.apps.kitty.state.def.is.vibrator ? ew.apps.kitty.vibrator.active ? 13 : ew.apps.kitty.state.is.vibrator.connected ? 4 : 6 : 1);
	//ew.UI.btn.c2l("main", "_2x3", 2, "VOLT", "MON", 15, ew.apps.kitty.state.def.is.voltMon ? 4 : 1);
	ew.UI.btn.c2l("main", "_2x3", 2, "CLB", E.toJS(-ew.apps.kitty.state.def.is.clb * 100), 15, 6);
	ew.UI.btn.c2l("main", "_2x3", 3, "POWER", ew.pin.CHRG.read() ? "OFF" : "ON", 15, ew.pin.CHRG.read() ? 1 : 4);
	ew.UI.btn.c2l("main", "_2x3", 4, "AUTO", "LIGHT", 15, ew.apps.kitty.state.def.auto.light ? 4 : 1);
	ew.UI.btn.c2l("main", "_2x3", 5, "AUTO", "PAUSE", 15, (ew.apps.scale.state.def.type == "down" && ew.apps.kitty.state.def.auto.pause) ? 4 : 1);
	ew.UI.btn.c2l("main", "_2x3", 6, "AUTO", "SCRN", 15, (ew.def.scrn) ? 4 : 1);

	//ew.UI.btn.c2l("main", "_2x3", 6, "POWER", ew.pin.CHRG.read() ? "OFF" : "ON", 15, ew.pin.CHRG.read() ? 1 : 4);
	ew.UI.c.end();
	//
	//ew.apps.kitty.vibrator.device.eval('ew.is.batt(1)').then(function(data) {
	//print("Got temperature "+data)});
	ew.UI.c.main._2x3 = (i, l) => {
		if (i == 1) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			if (l) {
				ew.apps.kitty.state.def.is.vibrator = 1 - ew.apps.kitty.state.def.is.vibrator;
				if (ew.def.info) ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "VIBRATOR", (ew.apps.kitty.state.def.is.vibrator) ? "ENABLED" : "DISABLED", 0, 15);
				ew.UI.btn.c2l("main", "_2x3", 1, "VIB", (ew.apps.kitty.state.def.is.vibrator && ew.apps.kitty.state.is.vibrator.connected) ? ew.apps.kitty.state.is.vibrator.battery : "", 15, ew.apps.kitty.state.def.is.vibrator ? 6 : 1);
				if (!ew.apps.kitty.state.def.is.vibrator && ew.apps.kitty.state.is.vibrator.connected) ew.apps.kitty.vibrator.disconnect();
				else if (ew.apps.kitty.state.def.is.vibrator && !ew.apps.kitty.state.is.vibrator.connected) ew.apps.kitty.vibrator.connect();
			}
			else {
				if (!ew.apps.kitty.state.def.is.vibrator) {
					ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "HOLD TO ENABLE", "VIBRATOR", 0, 15);
				}
				else {
					if (ew.apps.kitty.state.is.vibrator) {
						if (ew.def.info) ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "VIBRATION", ew.apps.kitty.vibrator.active ? "STOP" : "START", 15, 6);
						ew.UI.btn.c2l("main", "_2x3", 1, "VIB", (ew.apps.kitty.state.def.is.vibrator && ew.apps.kitty.state.is.vibrator.connected) ? ew.apps.kitty.state.is.vibrator.battery : "", 15, ew.apps.kitty.state.def.is.vibrator ? ew.apps.kitty.vibrator.active ? 4 : 13 : 1);
						ew.apps.kitty.vibrator.write(ew.apps.kitty.vibrator.active ? "turnOff" : "turnOn");
					}
					else {
						ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "VIBRATOR", "NOT FOUND", 15, 13);
					}
				}
			}
		}
		/*else if (i == 2) {
			if (l) {
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				ew.apps.kitty.state.def.is.voltMon = 1 - ew.apps.kitty.state.def.is.voltMon;
				if (ew.def.info) ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "VOLT MONITOR", ew.apps.kitty.state.def.is.voltMon ? "ENABLED" : "DISABLED", 0, 15);
				ew.UI.btn.c2l("main", "_2x3", 2, "VOLT", "MON", 15, ew.apps.kitty.state.def.is.voltMon ? 4 : 1);
			}
			else {
				ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "HOLD TO ENABLE", "VOLT MONITOR", 0, 15);
			}
		}*/
		else if (i == 2) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "BALL", "CALIBRATION", 15, 6, 1);
			ew.temp.bar = 1;
			ew.sys.TC.val = { cur: -ew.apps.kitty.state.def.is.clb * 100, dn: 0, up: 9, tmp: 0 };
			ew.UI.c.tcBar = (a, b) => {
				ew.UI.btn.ntfy(0, 2, 1);
				ew.UI.btn.c2l("main", "_2x3", 2, "CLB", E.toJS(b), 15, 6);
				ew.apps.kitty.state.def.is.clb = -b / 100;
			};
		}
		else if (i == 3) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.sys.emit("button", "double");
		}
		else if (i == 4) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			if (!ew.apps.kitty.state.def.is.scale) {
				ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "PLEASE ENABLE", "THE SCALE", 15, 13);
			}
			else {
				ew.apps.kitty.state.def.auto.light = 1 - ew.apps.kitty.state.def.auto.light;
				if (ew.def.info) ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "AUTO LIGHT", ew.apps.kitty.state.def.auto.light ? "ENABLED" : "DISABLED", 0, 15);
				ew.UI.btn.c2l("main", "_2x3", 4, "AUTO", "LIGHT", 15, ew.apps.kitty.state.def.auto.light ? 4 : 1);
			}
		}
		else if (i == 5) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			if (ew.apps.scale.state.def.type == "side") {
				ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "NOT AVAILABLE", "FOR SIDE SCALE", 15, 13);
			}
			else if (!ew.apps.kitty.state.def.is.scale) {
				ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "PLEASE ENABLE", "THE SCALE", 15, 13);
			}
			else {
				ew.apps.kitty.state.def.auto.pause = 1 - ew.apps.kitty.state.def.auto.pause;
				if (ew.def.info) ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "AUTO PAUSE", ew.apps.kitty.state.def.auto.light ? "ENABLED" : "DISABLED", 0, 15);
				ew.UI.btn.c2l("main", "_2x3", 5, "AUTO", "PAUSE", 15, ew.apps.kitty.state.def.auto.pause ? 4 : 1);
			}
		}
		else if (i == 6) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.def.scrn = 1 - ew.def.scrn;
			if (ew.def.info) ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "AUTO SCREEN ON", ew.apps.kitty.state.def.auto.light ? "ENABLED" : "DISABLED", 0, 15);
			ew.UI.btn.c2l("main", "_2x3", 6, "AUTO", "SCRN", 15, (ew.def.scrn) ? 4 : 1);
		}

	};
};
ew.face[0].d1();
ew.face[0].d2 = function() {
	ew.face[0].page = "more2";
	ew.UI.ele.ind(2, 3, 0);
	ew.UI.c.start(1, 0);
	ew.UI.btn.c2l("main", "_2x3", 1, "TOF", ew.apps.kitty.state.def.is.tof ? "ON" : "OFF", 15, ew.apps.kitty.state.def.is.tof ? 4 : 1);
	ew.UI.btn.c2l("main", "_2x3", 2, "FULL", ew.apps.kitty.state.def.tof.full, 15, ew.apps.kitty.state.def.is.tof ? 6 : 1);
	ew.UI.btn.c2l("main", "_2x3", 3, "EMPTY", ew.apps.kitty.state.def.tof.empty, 15, ew.apps.kitty.state.def.is.tof ? 6 : 1);
	ew.UI.btn.c2l("main", "_2x3", 4, "LID", ew.apps.kitty.state.def.is.lid ? 0.3 <= ew.apps.kitty.state.is.pos.lid ? "OPEN" : "SHUT" : "", 15, ew.apps.kitty.state.def.is.lid ? 4 : 1);
	ew.UI.btn.c2l("main", "_2x3", 5, "OPEN", ew.apps.kitty.state.def.lid.open, 15, ew.apps.kitty.state.def.is.lid ? 6 : 1);
	ew.UI.btn.c2l("main", "_2x3", 6, "SHUT", ew.apps.kitty.state.def.lid.shut, 15, ew.apps.kitty.state.def.is.lid ? 6 : 1);
	ew.UI.c.end();
	//
	ew.UI.c.main._2x3 = (i, l) => {
		if (i == 1) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			if (l)
				ew.face.go("ToF", 0);
			else {
				ew.apps.kitty.state.def.is.tof = 1 - ew.apps.kitty.state.def.is.tof;
				ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "HOLD FOR", "TOF SETUP", 0, 15);
				ew.UI.btn.c2l("main", "_2x3", 1, "ToF", ew.apps.kitty.state.def.is.tof ? "ON" : "OFF", 15, ew.apps.kitty.state.def.is.tof ? 4 : 1);
				ew.UI.btn.c2l("main", "_2x3", 2, "FULL", ew.apps.kitty.state.def.tof.full, 15, ew.apps.kitty.state.def.is.tof ? 6 : 1);
				ew.UI.btn.c2l("main", "_2x3", 3, "EMPTY", ew.apps.kitty.state.def.tof.empty, 15, ew.apps.kitty.state.def.is.tof ? 6 : 1);
			}
		}
		else if (i == 2) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "SET TOF", "FULL (CM)", 15, 6, 1);
			ew.temp.bar = 1;
			ew.sys.TC.val = { cur: ew.apps.kitty.state.def.tof.full * 10, dn: 50, up: 450, tmp: 0 };
			ew.UI.c.tcBar = (a, b) => {
				ew.UI.btn.ntfy(0, 2, 1);
				ew.UI.btn.c2l("main", "_2x3", 2, "FULL", b / 10, 15, ew.apps.kitty.state.def.is.tof ? 6 : 1);
				ew.apps.kitty.state.def.tof.full = b / 10;
			};
		}
		else if (i == 3) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "SET TOF", "EMPTY (CM)", 15, 6, 1);
			ew.temp.bar = 1;
			ew.sys.TC.val = { cur: ew.apps.kitty.state.def.tof.empty * 10, dn: 50, up: 450, tmp: 0 };
			ew.UI.c.tcBar = (a, b) => {
				ew.UI.btn.ntfy(0, 2, 1);
				ew.UI.btn.c2l("main", "_2x3", 3, "EMPTY", b / 10, 15, ew.apps.kitty.state.def.is.tof ? 6 : 1);
				ew.apps.kitty.state.def.tof.empty = b / 10;
			};
		}

		if (i == 4) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			if (l) {
				ew.apps.kitty.state.def.is.lid = 1 - ew.apps.kitty.state.def.is.lid;
				if (ew.def.info) ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "LID SERVO", ew.apps.kitty.state.def.is.lid ? "ENABLED" : "DISABLED", 0, 15);
				ew.UI.btn.c2l("main", "_2x3", 4, "LID", ew.apps.kitty.state.def.is.lid ? 0.3 <= ew.apps.kitty.state.is.pos.lid ? "OPEN" : "SHUT" : "", 15, ew.apps.kitty.state.def.is.lid ? 4 : 1);
				ew.UI.btn.c2l("main", "_2x3", 5, "OPEN", ew.apps.kitty.state.def.lid.open, 15, ew.apps.kitty.state.def.is.lid ? 6 : 1);
				ew.UI.btn.c2l("main", "_2x3", 6, "SHUT", ew.apps.kitty.state.def.lid.shut, 15, ew.apps.kitty.state.def.is.lid ? 6 : 1);
			}
			else {
				if (!ew.apps.kitty.state.def.is.lid) {
					ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "HOLD TO ENABLE", "LID SERVO", 0, 15);
				}
				else {
					if (ew.pin.CHRG.read()) {
						ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "TURN POWER ON", "TO USE THE LID", 15, 13);
					}
					else {
						ew.apps.kitty.call.go(ew.apps.kitty.pattern("lid_toggle"));
						ew.UI.btn.c2l("main", "_2x3", 4, "LID", 0.3 <= ew.apps.kitty.state.is.pos.lid ? "SHUT" : "OPEN", 15, ew.apps.kitty.state.def.is.lid ? 4 : 1);
					}
				}
			}
		}
		else if (i == 5) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			if (!ew.apps.kitty.state.def.is.lid) {
				ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "LID SERVO", "IS DISABLED", 15, 13);
			}
			else if (ew.apps.kitty.state.is.pos.lid <= 0.31) {
				ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "THE LID IS ", "NOT OPEN", 15, 13);
			}
			else {
				ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "SET OPEN", "POSITION", 15, 6, 1);
				ew.temp.bar = 1;
				ew.sys.TC.val = { cur: ew.apps.kitty.state.def.lid.open * 100, dn: 40, up: 60, tmp: 0 };
				ew.UI.c.tcBar = (a, b) => {
					ew.UI.btn.ntfy(0, 8, 1);
					ew.UI.btn.c2l("main", "_2x3", 5, "OPEN", b / 100, 15, 6);
					ew.apps.kitty.state.def.lid.open = b / 100;
					ew.apps.kitty.state.is.pos.lid = ew.apps.kitty.state.def.lid.open;
					ew.apps.kitty.call.servo(D27, ew.apps.kitty.state.def.lid.open, 0);
				};
			}
		}
		else if (i == 6) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			if (!ew.apps.kitty.state.def.is.lid) {
				ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "LID SERVO", "IS DISABLED", 15, 13);
			}
			else if (0.3 <= ew.apps.kitty.state.is.pos.lid) {
				ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "THE LID IS ", "NOT SHUT", 15, 13);
			}
			else {
				ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "SET SHUT", "POSITION", 15, 6, 1);
				ew.temp.bar = 1;
				ew.sys.TC.val = { cur: ew.apps.kitty.state.def.lid.shut * 100, dn: 1, up: 20, tmp: 0 };
				ew.UI.c.tcBar = (a, b) => {
					ew.UI.btn.ntfy(0, 8, 1);
					ew.UI.btn.c2l("main", "_2x3", 6, "SHUT", b / 100, 15, 6);
					ew.apps.kitty.state.def.lid.shut = b / 100;
					ew.apps.kitty.state.is.pos.lid = ew.apps.kitty.state.def.lid.shut;
					ew.apps.kitty.call.servo(D27, ew.apps.kitty.state.def.lid.shut, 0);
				};
			}
		}

	};
};
ew.face[0].d3 = function() {
	ew.face[0].page = "more3";
	ew.UI.ele.ind(3, 3, 0);
	ew.UI.c.start(1, 0);
	ew.UI.btn.c2l("main", "_2x3", 1, "SCALE", ew.apps.kitty.state.def.is.scale ? "ON" : "OFF", 15, ew.apps.kitty.state.def.is.scale ? 4 : 1);
	ew.UI.btn.c2l("main", "_2x3", 2, "MAX", ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max / 1000, 15, ew.apps.kitty.state.def.is.scale ? 6 : 1);
	ew.UI.btn.c2l("main", "_2x3", 3, "MIN", ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].min / 1000, 15, ew.apps.kitty.state.def.is.scale ? 6 : 1);
	ew.UI.btn.c2l("main", "_2x3", 4, "SENCE", ew.apps.scale.state.value.tolerance, 15,ew.apps.kitty.state.def.is.scale ? 6 : 1);
	ew.UI.btn.c2l("main", "_2x3", 5, "MOVE", ew.apps.scale.state.value.sensitivity, 15,ew.apps.kitty.state.def.is.scale ? 6 : 1);
	ew.UI.btn.c2l("main", "_2x3", 6, "", "", 1);
	ew.UI.c.end();
	//
	ew.UI.c.main._2x3 = (i, l) => {

		if (i == 1) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);

			if (l)
				ew.face.go("scale_calib", 0);
			else {
				ew.apps.kitty.state.def.is.scale = 1 - ew.apps.kitty.state.def.is.scale;
				ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "HOLD FOR", "SCALE SETUP", 0, 15);
				ew.UI.btn.c2l("main", "_2x3", 1, "SCALE", ew.apps.kitty.state.def.is.scale ? "ON" : "OFF", 15, ew.apps.kitty.state.def.is.scale ? 4 : 1);
				ew.UI.btn.c2l("main", "_2x3", 2, "MAX", ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max / 1000, 15, ew.apps.kitty.state.def.is.scale ? 6 : 1); //3
				ew.UI.btn.c2l("main", "_2x3", 3, "MIN", ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].min / 1000, 15, ew.apps.kitty.state.def.is.scale ? 6 : 1); //6
				ew.UI.btn.c2l("main", "_2x3", 4, "SENCE", ew.apps.scale.state.value.tolerance, 15,ew.apps.kitty.state.def.is.scale ? 6 : 1);
				ew.UI.btn.c2l("main", "_2x3", 5, "MOVE", ew.apps.scale.state.value.sensitivity, 15,ew.apps.kitty.state.def.is.scale ? 6 : 1);

				if (ew.apps.kitty.state.def.is.scale) {
					ew.apps.scale.start();
				}
				else {
					ew.apps.scale.stop();
					ew.apps.kitty.state.def.auto.light = 0;
					ew.apps.kitty.state.def.auto.clean = 0;
					ew.apps.kitty.state.def.auto.pause = 0;
				}
			}
		}
		else if (i == 2) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "SET MAX", "SAND WEIGHT (KG)", 15, 6, 1);
			ew.temp.bar = 1;
			ew.sys.TC.val = { cur: ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max / 100, dn: 14, up: 40, tmp: 0 };
			ew.UI.c.tcBar = (a, b) => {
				ew.UI.btn.ntfy(0, 2, 1);
				ew.UI.btn.c2l("main", "_2x3", 2, "MAX", b / 10, 15, ew.apps.kitty.state.def.is.scale ? 6 : 1); //6
				ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max = b * 100;
			};
		}
		else if (i == 3) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "SET MIN", "SAND WEIGHT (KG)", 15, 6, 1);
			ew.temp.bar = 1;
			ew.sys.TC.val = { cur: ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].min / 100, dn: 5, up: 15, tmp: 0 };
			ew.UI.c.tcBar = (a, b) => {
				ew.UI.btn.ntfy(0, 2, 1);
				ew.UI.btn.c2l("main", "_2x3", 3, "MIN", b / 10, 15, ew.apps.kitty.state.def.is.scale ? 6 : 1); //6
				ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].min = b * 100;
			};
		}
		else if (i == 4) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "TRIGGER TOLLERANCE", "WEIGTH (GRAMS)", 15, 6, 1);
			ew.temp.bar = 1;
			ew.sys.TC.val = { cur: ew.apps.scale.state.value.tolerance/10 , dn: 40, up: 150, tmp: 0 };
			ew.UI.c.tcBar = (a, b) => {
				ew.UI.btn.ntfy(0, 2, 1);
				ew.apps.scale.state.value.tolerance = b*10;
				ew.UI.btn.c2l("main", "_2x3", 4, "SENCE", ew.apps.scale.state.value.tolerance, 15,ew.apps.kitty.state.def.is.scale ? 6 : 1);			};
		}
		else if (i == 5) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "MOVE SENSITIVIY", "WEIGTH (GRAMS)", 15, 6, 1);
			ew.temp.bar = 1;
			ew.sys.TC.val = { cur: ew.apps.scale.state.value.sensitivity , dn: 5, up: 20, tmp: 0 };
			ew.UI.c.tcBar = (a, b) => {
				ew.UI.btn.ntfy(0, 2, 1);
				ew.apps.scale.state.value.sensitivity = b;
				ew.UI.btn.c2l("main", "_2x3", 5, "MOVE", b, 15,ew.apps.kitty.state.def.is.scale ? 6 : 1);			};
		}
	};
};
