E.setFlags({ pretokenise: 1 });
//dash  Options
//ew.UI.nav.next.replaceWith(new Function("x", "y",'setTimeout(()=>{'+ew.UI.c.raw.main+ew.UI.c.raw.bar+'},0);'));
ew.UI.nav.next.replaceWith((x, y) => {
	//if (ew.face[0].page == "dash2") {
	ew.sys.buzz.nav(ew.sys.buzz.type.na);
	return;
	//}
	ew.sys.buzz.nav(ew.sys.buzz.type.ok);
	ew.face[0].d2();
	if (ew.UI.ntid) {
		clearTimeout(ew.UI.ntid);
		ew.UI.ntid = 0;
		ew.face[0].bar();
	}
});
ew.UI.nav.back.replaceWith((x, y) => {
	if (ew.face[0].page == "dash1") {
		ew.sys.buzz.nav(ew.sys.buzz.type.ok);
		eval(require("Storage").read("ew_f_set_apps"));
		if (ew.UI.ntid) {
			clearTimeout(ew.UI.ntid);
			ew.UI.ntid = 0;
		}
		ew.face[0].bar();
		//ew.apps.kitty.state.update();
		return;
	}
	ew.sys.buzz.nav(ew.sys.buzz.type.ok);
	ew.face[0].d1();
	if (ew.UI.ntid) {
		clearTimeout(ew.UI.ntid);
		ew.UI.ntid = 0;
	}
	ew.face[0].bar();
});
//
ew.face[0].page = "dash1";

ew.face[0].d1 = function() {
	ew.face[0].page = "dash1";
	//this.sandType = { 1: "betonite", 2: "silicone", 3: "pellet", 4: "tofu" };
	ew.UI.c.start(1, 0);
	ew.UI.ele.ind(3, 3, 0);
	ew.UI.ele.fill("_main", 9, 0);
	ew.UI.btn.c2l("main", "_2x3", 1, "AUTO", "CLEAN", 15, (ew.apps.kitty.state.def.auto.clean) ? 4 : 1);
	ew.UI.btn.c2l("main", "_2x3", 2, "SAND", ew.apps.kitty.state.def.is.sandType, 15, 6);
	//ew.UI.btn.c2l("main", "_2x3", 3, "UVC", ew.apps.kitty.state.def.auto.uvc ? "ON" : "OFF", 15, ew.apps.kitty.state.def.auto.uvc ? 4 : 1);
	ew.UI.btn.c2l("main", "_2x3", 3, "PREP", ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].prep ? "ON" : "OFF", 15, ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].prep ? 4 : 1);
	ew.UI.btn.c2l("main", "_2x3", 4, "DELAY", ew.apps.kitty.state.def.auto.delay, 15, (ew.apps.kitty.state.def.auto.clean) ? 6 : 1);
	ew.UI.btn.c2l("main", "_2x3", 5, "SPEED", (19 - (ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].speed * 10)), 15, 6);
	ew.UI.btn.c2l("main", "_2x3", 6, "MORE", "", 15, 6);
	ew.UI.c.end();
	//
	ew.UI.c.main._2x3 = (i) => {
		if (i == 1) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			if (!ew.apps.kitty.state.def.is.scale){
				ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "PLEASE ENABLE", "THE SCALE", 15, 13);
			}else{
			ew.apps.kitty.state.def.auto.clean = 1 - ew.apps.kitty.state.def.auto.clean;
			if (!ew.apps.kitty.state.def.auto.clean) ew.apps.scale.clean(0);
			if (ew.def.info) ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "AUTO CLEAN", (ew.apps.kitty.state.def.auto.clean) ? "ENABLED" : "DISABLED", 0, 15);
			ew.UI.btn.c2l("main", "_2x3", 1, "AUTO", "CLEAN", 15, (ew.apps.kitty.state.def.auto.clean) ? 4 : 1);
			ew.UI.btn.c2l("main", "_2x3", 4, "DELAY", ew.apps.kitty.state.def.auto.delay, 15, (ew.apps.kitty.state.def.auto.clean) ? 6 : 1); //4
			}
				
		}
		else if (i == 2) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.apps.kitty.state.def.is.sandType++;
			if (5 <= ew.apps.kitty.state.def.is.sandType) ew.apps.kitty.state.def.is.sandType = 1;
			if (ew.def.info) ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "SAND TYPE", ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].name.toUpperCase(), 0, 15);
			ew.UI.btn.c2l("main", "_2x3", 2, "SAND", ew.apps.kitty.state.def.is.sandType, 15, 6);
			ew.UI.btn.c2l("main", "_2x3", 5, "SPEED", (19 - (ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].speed * 10)), 15, 6); //5
			ew.UI.btn.c2l("main", "_2x3", 3, "PREP", ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].prep ? "ON" : "OFF", 15, ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].prep ? 4 : 1);
		}
		/*else if (i == 3) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.apps.kitty.state.def.auto.uvc = 1 - ew.apps.kitty.state.def.auto.uvc;
			if (ew.def.info) ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "TRIGGER UVC", (ew.apps.kitty.state.def.auto.uvc) ? "ENABLED" : "DISABLED", 0, 15);
			ew.UI.btn.c2l("main", "_2x3", 3, "UVC", ew.apps.kitty.state.def.auto.uvc ? "ON" : "OFF", 15, ew.apps.kitty.state.def.auto.uvc ? 4 : 1);
		}*/
		else if (i == 3) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].prep = 1 - ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].prep;
			if (ew.def.info) ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "PREPARE MOTION", (ew.apps.kitty.state.def.auto.uvc) ? "ENABLED" : "DISABLED", 0, 15);
			ew.UI.btn.c2l("main", "_2x3", 3, "PREP", ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].prep ? "ON" : "OFF", 15, ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].prep ? 4 : 1);
		}
		else if (i == 4) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "AUTO CLEAN", "DELAY (MINUTES)", 15, 6, 1);
			ew.temp.bar = 1;
			ew.sys.TC.val = { cur: ew.apps.kitty.state.def.auto.delay, dn: 1, up: 20, tmp: 0 };
			ew.UI.c.tcBar = (a, b) => {
				ew.UI.btn.ntfy(0, 2, 1);
				ew.UI.btn.c2l("main", "_2x3", 4, "DELAY", b, 15, (ew.apps.kitty.state.def.auto.clean) ? 6 : 1); //6
				ew.apps.kitty.state.def.auto.delay = b;
			};
		}
		else if (i == 5) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "SET SPEED", ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].name.toUpperCase(), 15, 6, 1);
			ew.temp.bar = 1;
			ew.sys.TC.val = { cur: (19 - (ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].speed * 10)), dn: 1, up: 9, tmp: 0 };
			ew.UI.c.tcBar = (a, b) => {
				ew.UI.btn.ntfy(0, 2, 1);
				ew.UI.btn.c2l("main", "_2x3", 5, "SPEED", b, 15, 6); //5
				ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].speed = (19 - b) / 10;
			};
			return;
		}
		else if (i == 6) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			eval(require("Storage").read("ew_f_set_more"));
			if (ew.UI.ntid) {
				clearTimeout(ew.UI.ntid);
				ew.UI.ntid = 0;
			}
			ew.face[0].bar();
			return;
		}
	};
};
ew.face[0].d1();
ew.face[0].d2 = function() {
	ew.face[0].page = "dash2";
	ew.UI.ele.ind(4, 4, 0);
	ew.UI.c.start(1, 0);
	ew.UI.btn.c2l("main", "_2x3", 1, "TOF", ew.apps.kitty.state.def.is.tof ? "ON" : "OFF", 15, ew.apps.kitty.state.def.is.tof ? 4 : 1);
	ew.UI.btn.c2l("main", "_2x3", 2, "FULL", ew.apps.kitty.state.def.tof.full, 15, ew.apps.kitty.state.def.is.tof ? 6 : 1);
	ew.UI.btn.c2l("main", "_2x3", 3, "EMPTY", ew.apps.kitty.state.def.tof.empty, 15, ew.apps.kitty.state.def.is.tof ? 6 : 1);
	ew.UI.btn.c2l("main", "_2x3", 4, "SCALE", ew.apps.kitty.state.def.is.scale ? "ON" : "OFF", 15, ew.apps.kitty.state.def.is.scale ? 4 : 1);
	ew.UI.btn.c2l("main", "_2x3", 5, "MAX", ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max / 1000, 15, ew.apps.kitty.state.def.is.scale ? 6 : 1);
	ew.UI.btn.c2l("main", "_2x3", 6, "MIN", ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].min / 1000, 15, ew.apps.kitty.state.def.is.scale ? 6 : 1);
	ew.UI.c.end();
	//
	ew.UI.c.main._2x3 = (i, l) => {
		if (i == 1) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			if (l)
				ew.face.go("ToF", 0);
			else {
				ew.apps.kitty.state.def.is.tof = 1 - ew.apps.kitty.state.def.is.tof;
				ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "HOLD FOR", "ToF SETUP", 0, 15);
				ew.UI.btn.c2l("main", "_2x3", 1, "ToF", ew.apps.kitty.state.def.is.tof ? "ON" : "OFF", 15, ew.apps.kitty.state.def.is.tof ? 4 : 1);
				ew.UI.btn.c2l("main", "_2x3", 2, "FULL", ew.apps.kitty.state.def.tof.full, 15, ew.apps.kitty.state.def.is.tof ? 6 : 1);
				ew.UI.btn.c2l("main", "_2x3", 3, "EMPTY", ew.apps.kitty.state.def.tof.empty, 15, ew.apps.kitty.state.def.is.tof ? 6 : 1);
			}
		}
		else if (i == 2) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "SET TOF", "FULL (CM)", 15, 6, 1);
			ew.temp.bar = 1;
			ew.sys.TC.val = { cur: ew.apps.kitty.state.def.tof.full * 10, dn: 250, up: 450, tmp: 0 };
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
			ew.sys.TC.val = { cur: ew.apps.kitty.state.def.tof.empty * 10, dn: 250, up: 450, tmp: 0 };
			ew.UI.c.tcBar = (a, b) => {
				ew.UI.btn.ntfy(0, 2, 1);
				ew.UI.btn.c2l("main", "_2x3", 3, "EMPTY", b / 10, 15, ew.apps.kitty.state.def.is.tof ? 6 : 1);
				ew.apps.kitty.state.def.tof.empty = b / 10;
			};
		}
		else if (i == 4) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);

			if (l)
				ew.face.go("scale_calib", 0);
			else {
				ew.apps.kitty.state.def.is.scale = 1 - ew.apps.kitty.state.def.is.scale;
				ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "HOLD FOR", "SCALE SETUP", 0, 15);
				ew.UI.btn.c2l("main", "_2x3", 4, "SCALE", ew.apps.kitty.state.def.is.scale ? "ON" : "OFF", 15, ew.apps.kitty.state.def.is.scale ? 4 : 1);
				ew.UI.btn.c2l("main", "_2x3", 5, "MAX", ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max / 1000, 15, ew.apps.kitty.state.def.is.scale ? 6 : 1); //3
				ew.UI.btn.c2l("main", "_2x3", 6, "MIN", ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].min / 1000, 15, ew.apps.kitty.state.def.is.scale ? 6 : 1); //6
			}
		}
		else if (i == 5) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "SET MAX", "SAND WEIGHT (KG)", 15, 6, 1);
			ew.temp.bar = 1;
			ew.sys.TC.val = { cur: ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max / 100, dn: 15, up: 40, tmp: 0 };
			ew.UI.c.tcBar = (a, b) => {
				ew.UI.btn.ntfy(0, 2, 1);
				ew.UI.btn.c2l("main", "_2x3", 5, "MAX", b / 10, 15, ew.apps.kitty.state.def.is.scale ? 6 : 1); //6
				ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max = b * 100;
			};
		}
		else if (i == 6) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "SET MIN", "SAND WEIGHT (KG)", 15, 6, 1);
			ew.temp.bar = 1;
			ew.sys.TC.val = { cur: ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].min / 100, dn: 5, up: 15, tmp: 0 };
			ew.UI.c.tcBar = (a, b) => {
				ew.UI.btn.ntfy(0, 2, 1);
				ew.UI.btn.c2l("main", "_2x3", 6, "MIN", b / 10, 15, ew.apps.kitty.state.def.is.scale ? 6 : 1); //6
				ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].min = b * 100;
			};
		}
	};
};
