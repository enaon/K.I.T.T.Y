E.setFlags({ pretokenise: 1 });
//
ew.UI.nav.next.replaceWith((x, y) => {
	ew.sys.buzz.nav(ew.sys.buzz.type.ok);
	eval(require("Storage").read("set_apps"));
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

ew.face[0].ele = {},

	ew.face[0].d1 = function() {

		ew.face[0].page = "set";
		
		ew.UI.c.tcBar=()=>{};
		ew.UI.ele.ind(1, 3, 0);


		// ---- 1 bt ----
		ew.face[0].ele.btn_BT = UIM.add('btn', 'main3R1', 0, {
			text: ew.def.cli ? "bt" : "plane",
			bgColor: 4,
			txtColor: 15,
			round: 1,
			onTap: (i) => {
				
				if (i.longPress){
					ew.sys.buzz.nav(ew.sys.buzz.type.ok);
					if (ew.def.rfTX === -4) ew.def.rfTX = 0;
					else if (ew.def.rfTX === 0) ew.def.rfTX = ew.do.maxTx;
					else if (ew.def.rfTX === ew.do.maxTx) ew.def.rfTX = -4;
					NRF.setTxPower(ew.def.rfTX);
					ew.UI.btn.img("main", "_2x3", 1, ew.def.cli ? "bt" : "plane", "BT", 15, ew.def.cli ? 4 : 1);
					g.drawImage((ew.def.rfTX == -4) ? E.toArrayBuffer(atob("EyCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfAAPgAEQACIABEAAiAARAAIgAHz74=")) : (ew.def.rfTX == 0) ? E.toArrayBuffer(atob("EyCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4ADEABiAAxAfYgPsQEWICLEBFiAixARYgIsQHz74=")) : E.toArrayBuffer(atob("EyCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AARAAIgAEQD6IDFEBiiAxRfYovsUUWKKLFFFiiixRRYoosUXz74=")), 55, 65);
					ew.UI.btn.ntfy(1, 0, 0, "_bar", 6, "", ew.def.rfTX == -4 ? "TX MIN" : ew.def.rfTX == 0 ? "TX MED" : "TX MAX", 0, 15);
				}
				ew.def.cli = 1 - ew.def.cli;
				ew.do.update.bluetooth();
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				UIM.update(ew.face[0].ele.btn_BT, { bgColor: ew.def.cli ? 4 : 1 });
				if (ew.def.info) UIM.notify('bar', "BLUETOOTH", ew.def.cli ? "ENABLED" : "DISABLED", 3);
			}
		});

		// ---- 2 face ----
		ew.face[0].ele.btn_BT = UIM.add('btn', 'main3R1', 1, {
			text: "FACE",
			bgColor: 4,
			txtColor: 15,
			round: 1,
			onTap: () => {
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				UIM.init();
				eval(require('Storage').read('set_theme'));
			}
		});

		// ---- 3 BT BRIGHTNESS ----
		ew.face[0].ele.btn_brigthness = UIM.add('btn', 'main3R1', 2, {
			text: ew.def.bri,
			bgColor: 4,
			txtColor: 15,
			round: 1,
			onTap: () => {
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				ew.face[0].ele.slider = UIM.add('slider', 'bar', 0, {
					min: 1,
					max: 7,
					value: ew.def.bri,
					step: 1,
					mode: 'fast',
					padding: { x: 0.15, y: 0.40 },
					TC: "slide", // Ενεργοποίηση slide mode
					activeColor: 4, // Μπλε (ενεργές μπάρες)
					inactiveColor: 2, // Γκρι (ανενεργές)
					bgColor: 1,
					onTap: (i) => {
						console.log("slidpress", i.value);
						ew.def.bri = i.value;
						UIM.update(ew.face[0].ele.btn_brigthness, { text: i.value });
						g.bri.set(i.value);
					}
				});
			}
		});

		// ---- 4 screen ----
		ew.face[0].ele.scrn = UIM.add('btn', 'main3R2', 0, {
			text: "SCR",
			bgColor: ew.def.scrn ? 4 : 1,
			txtColor: 15,
			round: 1,
			onTap: () => {
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				ew.def.scrn = 1 - ew.def.scrn;
				UIM.update(ew.face[0].ele.scrn, { bgColor: ew.def.scrn ? 4 : 1 });
				if (ew.def.info) UIM.notify('bar', "AUTO WAKE SCREEN", ew.def.cli ? "ENABLED" : "DISABLED", 3);
			}
		});

		// ---- 5 about ----
		ew.face[0].ele.about = UIM.add('btn', 'main3R2', 1, {
			text: "about",
			bgColor:  4,
			txtColor: 15,
			round: 1,
			onTap: () => {
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
					ew.UI.txt.block("_main", 15, "\n" + "SCAT-A v2.0" + "\n\n" + "MEM: " + process.memory().free + "/" + process.memory().total + "\n" + "IMG: " + process.version + "-" + process.env.BOARD + "\n\n" + "UP: " + d + "D-" + h + "H-" + m + "M" + "\n" + "TEMP: " + E.getTemperature() + "\n\n" + "TOTAL: " + ew.apps.kitty.state.def.is.total + "\n\n" + "NAME: " + ew.def.name, 30, 15, 1, 1);
					g.setFont("Vector", 18);
					let time = Date().toString().split(" ");
					g.drawString(time[0] + " " + time[1] + " " + time[2] + " " + time[4], 120 - g.stringWidth(time[0] + " " + time[1] + " " + time[2] + " " + time[4]) / 2, 245);
					g.flip();
				}, 500);
			}
		});

		// ---- 6 power ----
		ew.face[0].ele.pwr = UIM.add('btn', 'main3R2', 2, {
			text: "PWR",
			bgColor: 4,
			txtColor: 15,
			round: 1,
			onTap: () => {
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				// 6- PWR
				ew.face[0].ele.PWR = UIM.notify('bar', "", "", {
					duration: 3, // 
					actions: [{
							text: "RESTART",
							bgColor: 7, // Κόκκινο
							actionId: "restart"
						},
						{
							text: "POWEROFF",
							bgColor: 1, // Γκρι
							actionId: "off"
						}
					],
					onAction: (actionId) => {
						ew.sys.buzz.nav(ew.sys.buzz.type.ok);
						UIM.clearNotifications('bar');
						if (actionId === "restart")
							ew.do.sysReset();
						else if (i == 5)
							ew.apps.kitty.call.sleep(1);
					}
				});
			}
		});
	g.flip();
	};

ew.face[0].d1();
