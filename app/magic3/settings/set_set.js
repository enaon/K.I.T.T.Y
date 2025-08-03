E.setFlags({ pretokenise: 1 });
//
ew.UI.nav.next.replaceWith((x, y) => {
	ew.sys.buzz.nav(ew.sys.buzz.type.ok);
	eval(require("Storage").read("ew_f_set_apps"));
	ew.face[0].bar();
});
ew.UI.nav.back.replaceWith((x, y) => { 
	//"jit";
	if (ew.face[0].page == "set1-info") {
		ew.sys.buzz.nav(ew.sys.buzz.type.ok);
		ew.face[0].d1();
		if (ew.UI.ntid) {
			clearTimeout(ew.UI.ntid);
			ew.UI.ntid = 0;
		}
		ew.face[0].bar();
		return;
	}
	ew.sys.buzz.nav(ew.sys.buzz.type.na);
});
//

ew.face[0].d1 = function() {
	ew.face[0].page = "set";
	ew.UI.ele.ind(1, 3, 0);
	ew.UI.c.start(1, 0);
	ew.UI.ele.fill("_main", 9, 0);
	ew.UI.btn.img("main", "_2x3", 1, ew.def.cli ? "bt" : "plane", "BT", 15, ew.def.cli ? 4 : 1);
	ew.UI.btn.img("main", "_2x3", 2, "themes", "FACE", 15, 6);
	ew.UI.btn.img("main", "_2x3", 3, "bri", ew.def.bri, 15, 6, 1);
	ew.UI.btn.img("main", "_2x3", 4, ew.def.buzz ? "buzzOn" : "buzzOff", "BUZZ", ew.def.buzz ? 15 : 3, ew.def.buzz ? 4 : 1);

	//ew.UI.btn.img("main", "_2x3", 4, ew.def.buzz ? "buzzOn" : "buzzOff", "BUZZ", ew.def.buzz ? 15 : 3, ew.def.buzz ? 4 : 1);
	ew.UI.btn.img("main", "_2x3", 6, "power", "PWR", 15, 6);
	ew.UI.btn.img("main", "_2x3", 5, "info", "ABOUT", 15, 6);
	ew.UI.c.end();
	//
	ew.UI.c.main._2x3 = (i, l) => {
		if (i == 1) {
			if (l) {
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				if (ew.def.rfTX === -4) ew.def.rfTX = 0;
				else if (ew.def.rfTX === 0) ew.def.rfTX = ew.do.maxTx;
				else if (ew.def.rfTX === ew.do.maxTx) ew.def.rfTX = -4;
				NRF.setTxPower(ew.def.rfTX);
				ew.UI.btn.img("main", "_2x3", 1, ew.def.cli ? "bt" : "plane", "BT", 15, ew.def.cli ? 4 : 1);
				g.drawImage((ew.def.rfTX == -4) ? E.toArrayBuffer(atob("EyCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfAAPgAEQACIABEAAiAARAAIgAHz74=")) : (ew.def.rfTX == 0) ? E.toArrayBuffer(atob("EyCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4ADEABiAAxAfYgPsQEWICLEBFiAixARYgIsQHz74=")) : E.toArrayBuffer(atob("EyCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AARAAIgAEQD6IDFEBiiAxRfYovsUUWKKLFFFiiixRRYoosUXz74=")), 55, 65);
				ew.UI.btn.ntfy(1, 0, 0, "_bar", 6, "", ew.def.rfTX == -4 ? "TX MIN" : ew.def.rfTX == 0 ? "TX MED" : "TX MAX", 0, 15);
				g.flip();

			}
			else {
				ew.def.cli = 1 - ew.def.cli;
				ew.do.update.bluetooth();
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				if (ew.def.info) ew.UI.btn.ntfy(1, 0, 0, "_bar", 6, "BLUETOOTH", ew.def.cli ? "ENABLED" : "DISABLED", 0, 15);
				g.flip();
				ew.UI.btn.img("main", "_2x3", 1, (ew.def.hid || ew.def.cli || ew.def.gb || ew.def.prxy) ? "bt" : "plane", "BT", 15, (ew.def.hid || ew.def.cli || ew.def.gb || ew.def.prxy) ? 4 : 1);
			}
		}
		else if (i == 2) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			eval(require('Storage').read('ew_f_set_theme'));
			if (ew.UI.ntid) {
				clearTimeout(ew.UI.ntid);
				ew.UI.ntid = 0;
				ew.face[0].bar();
			}
		}
		else if (i == 3) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.UI.btn.ntfy(1, 3, 0, "_bar", 6, "BRIGHTNESS", ". . . . . . . . .", 15, 6, 1);
			ew.temp.bar = 1;
			ew.sys.TC.val = { cur: ew.def.bri, dn: 1, up: 7, tmp: 0 };
			ew.UI.c.tcBar = (a, b) => {
				ew.UI.btn.ntfy(0, 3, 1);
				ew.UI.btn.img("main", "_2x3", 3, "bri", b, 15, 6, 1);
				g.bri.set(b);
				ew.def.bri = b;
			};
		}
		else if (i == 4) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.def.buzz = 1 - ew.def.buzz;
			if (ew.def.info) ew.UI.btn.ntfy(1, 0, 0, "_bar", 6, "HAPTIC", ew.def.buzz ? "ENABLED" : "DISABED", 0, 15);
			ew.UI.btn.img("main", "_2x3", 4, ew.def.buzz ? "buzzOn" : "buzzOff", "SCRN", ew.def.buzz ? 15 : 3, ew.def.scrn ? 4 : 1);
		}
		/*
		else if (i == 4) {
			ew.def.buzz = 1 - ew.def.buzz;
			if (ew.def.info) ew.UI.btn.ntfy(1, 0, 0, "_bar", 6, "BUZZER", ew.def.buzz ? "ENABLED" : "DISABED", 0, 15);
			ew.UI.btn.img("main", "_2x3", 4, ew.def.buzz ? "buzzOn" : "buzzOff", "BUZZ", ew.def.buzz ? 15 : 3, ew.def.buzz ? 4 : 1);
			if (ew.def.buzz) {
				ew.sys.buzz.nav = digitalPulse.bind(null, ew.pin.BUZZ, ew.pin.BUZ0);
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			}
			else {
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				ew.sys.buzz.nav = function() {};
			}
		}*/
		else if (i == 6) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.UI.btn.ntfy(0, 3, 1, "_bar", 6, "", "", 15, 0);
			ew.UI.c.start(0, 1);
			ew.UI.btn.img("bar", "_bar", 4, "restart", "RST", 15, 6);
			ew.UI.btn.img("bar", "_bar", 5, "power", "OFF", 15, 13);
			ew.UI.c.end();
			ew.UI.c.bar._bar = (i) => {
				if (i == 4) 
					ew.do.sysReboot();
				else if (i == 5) 
					ew.apps.kitty.call.sleep("deep");
			};
		}
		else if (i == 5) {
			ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			ew.UI.btn.ntfy(0, 10, 1, "_bar", 6, "", "", 15, 0);
			ew.UI.c.start(1, 1);
			ew.UI.c.end();
			let s = (getTime() - ew.is.boot) | 0;
			let d = 0;
			let h = 0;
			let m = 0;
			if (s > 864000) {
				ew.is.boot = getTime();
				s = (getTime() - ew.is.boot) | 0;
			}
			while (s > 86400) {
				s = s - 86400;
				d++;
			}
			while (s > 3600) {
				s = s - 3600;
				h++;
			}
			while (s > 60) {
				s = s - 60;
				m++;
			}
			ew.UI.btn.img("bar", "_main", 15, "kitty_bw1", "", 10, 0);
      /*g.clear();
      g.setCol(0,0);
       g.setCol(1,10); g.drawImage(require("heatshrink").decompress(atob(_icon.kitty_bw)), 35, 65, { scale: 3 });
      g.flip();
      */
			ew.face[0].page = "set1-info";
			if (ew.UI.ntid) clearTimeout(ew.UI.ntid);
			ew.UI.ntid = setTimeout(() => {
				ew.UI.ntid = 0;
				ew.UI.txt.block("_main", 15, "\n" + "K.I.T.T.Y v2.0" + "\n\n" + "MEM: " + process.memory().free + "/" + process.memory().total + "\n" + "IMG: " + process.version + "-" + process.env.BOARD + "\n\n" + "UP: " + d + "D-" + h + "H-" + m + "M" + "\n" + "TEMP: " + E.getTemperature() + "\n\n" + "TOTAL: " + ew.apps.kitty.state.def.is.total + "\n\n" + "NAME: " + ew.def.name, 30, 15, 1, 1);
				g.setFont("Vector", 18);
				let time=Date().toString().split(" ");
				g.drawString( time[0]+" "+time[1]+ " "+time[2]+" "+time[4], 120 - g.stringWidth( time[0]+" "+time[1]+ " "+time[2]+" "+time[4] ) /2, 245);
				g.flip();
			}, 500);

		}
	};
};

ew.face[0].d1();
