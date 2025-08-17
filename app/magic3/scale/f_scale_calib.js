//scale calibration face
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
		//start ew.apps.scale  if off
		if (!ew.apps.scale.do.isReady()) ew.apps.scale.init();
		ew.apps.scale.stop()
		this.calibrate=1350;
		g.clear();
		g.setCol(0, 15);
		g.setFont("Vector", 20);
		g.drawString("CALIBRATE", 120 - g.stringWidth("CALIBRATE") / 2, 5); //litter
		ew.UI.c.start(1, 0);
			ew.UI.btn.c1l("main", "_lcd", 2, "1.350","", 15, 0, 0.85);
			ew.UI.ele.coord("main", "_2x3", 4);
			ew.UI.ele.coord("main", "_2x3", 5);
			ew.UI.ele.coord("main", "_2x3", 6);
		ew.UI.c.end();
		
		ew.UI.c.main._2x3 = (i, l) => {
			if (i == 4) {
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "SET", "WEIGHT *1000", 15, 6, 1);
				ew.temp.bar = 1;
				ew.sys.TC.val = { cur: 1, dn: 3, up: 9, tmp: 0 };
				ew.UI.c.tcBar = (a, b) => {
					ew.UI.btn.ntfy(0, 3, 1);
					ew.face[0].calibrate=a*1000+ew.face[0].calibrate;
					if (9999<=ew.face[0].calibrate) ew.face[0].calibrate=9990;
					if (ew.face[0].calibrate<=1300) ew.face[0].calibrate=1300;
					ew.UI.btn.c2l("main", "_lcd", 2, (ew.face[0].calibrate/1000 ).toFixed(3),"", 15, 0, 0.85);
				};
			}
			else if (i == 5) {
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "SET", "WEIGHT *100", 15, 6, 1);
				ew.temp.bar = 1;
				ew.sys.TC.val = { cur: 1, dn: 0, up: 99, tmp: 0 };
				ew.UI.c.tcBar = (a, b) => {
					ew.UI.btn.ntfy(0, 3, 1);
					ew.face[0].calibrate=ew.face[0].calibrate+(a*100);
					if (9999<=ew.face[0].calibrate) ew.face[0].calibrate=9990;
					if (ew.face[0].calibrate<=1300) ew.face[0].calibrate=1300;
					ew.UI.btn.c2l("main", "_lcd", 2, (ew.face[0].calibrate/1000 ).toFixed(3),"", 15, 0, 0.85);
				};
			}
			else if (i == 6) {
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "SET", "WEIGHT *10", 15, 6, 1);
				ew.temp.bar = 1;
				ew.sys.TC.val = { cur: 1, dn: 0, up: 99, tmp: 0 };
				ew.UI.c.tcBar = (a, b) => {
					ew.UI.btn.ntfy(0, 3, 1);
					ew.face[0].calibrate=ew.face[0].calibrate+(a*10);
					if (15000<=ew.face[0].calibrate) ew.face[0].calibrate=15000;
					if (ew.face[0].calibrate<=1300) ew.face[0].calibrate=1300;
					ew.UI.btn.c2l("main", "_lcd", 2, (ew.face[0].calibrate/1000 ).toFixed(3),"", 15, 0, 0.85);
				};
			}
		};
		this.bar();
		//this.run = 1;
	},
	show: function() {
		if (!this.run) return;
		
		this.tid = setTimeout(function(t, o) {
			t.tid = -1;
			t.show();
		}, 500, this);
	},
	bar: function() {
		if (ew.is.UIpri) { ew.notify.alert("error",ew.notify.log.error[0], 1, 1);return;}
		ew.temp.bar = 0;
		ew.UI.c.start(0, 1);
		ew.UI.btn.c2l("bar", "_bar", 4, "NOB","", 15, 6, 1.5);
		ew.UI.btn.c2l("bar", "_bar", 5, "CLB","", 15, 8, 1.5);
		ew.UI.c.end();
		ew.UI.c.bar._bar = (i,l) => {
			if (!l) {ew.UI.btn.ntfy(1,3,0,"_bar",6,"PLEASE USE","LONG PRESS",15,13);return;}
			if (i == 4) {
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				ew.UI.btn.ntfy(1,3,0,"_bar",6,"NO BALL WEIGHT","SET",0,15);
				ew.apps.scale.do.tare();
			}
			else if (i == 5) {
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				ew.UI.btn.ntfy(1,3,0,"_bar",6,"KNOWN WEIGHT","SET",0,15);
				ew.apps.scale.do.calculateScale(ew.face[0].calibrate);
			}
		};
	},
	tid: -1,
	run: false,
	clear: function() {
		ew.temp.bar = 0; /*TC.removeAllListeners();*/
		if (this.tid) clearTimeout(this.tid);
		this.tid = 0;
		ew.apps.scale.init();
		if (ew.apps.kitty.state.def.is.scale ) ew.apps.scale.start();
		return true;
	},
	off: function() {
		g.off();
		this.clear();
	}
};
