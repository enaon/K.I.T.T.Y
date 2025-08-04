//Scale face
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
		ew.apps.scale.state.is.bypass=1;
		if (!ew.apps.scale.do.isReady()) ew.apps.scale.do.setStandby(0);
		g.clear();
		this.tab = 1;
		g.setCol(0, 15);
		g.setFont("LECO1976Regular22");
		//g.setFont("Vector", 20);
		g.drawString("SCALE", 95, 5); //litter
		this.tare = 0;
		this.lost = 0;
		this.weight = 0;
		this.cache = { weight: -1 };
		this.ele.weight();
		this.bar();
		this.run = 1;
	},
	show: function() {
		if (!this.run) return;
		this.tempW = Math.round(ew.apps.scale.do.readGrams());
		if (this.tempW == ew.apps.scale.state.def.lost) {
			this.lost++;
			this.weight = 4 <= this.lost ? "lost" : this.weight;
		}
		else {
			this.lost = 0;
			this.weight = this.tempW != ew.apps.scale.state.def.lost ? this.tempW - ew.apps.scale.state.def.ball : this.weight;
		}
		this.ele.weight();
		g.flip();
		//this.ele.waste();
		this.tid = setTimeout(function(t, o) {
			t.tid = -1;
			t.show();
		}, 250, this);
	},
	bar: function() {
		if (ew.is.UIpri) { ew.notify.alert("error",ew.notify.log.error[0], 1, 1);return;}
		ew.temp.bar = 0;
		ew.UI.ele.fill("_bar", 6, 0);
		this.ele.tare();
		ew.UI.c.start(1, 1);
		ew.UI.ele.coord("bar", "_bar", 6);
		ew.UI.c.end();
		ew.UI.c.bar._bar = (i) => {
			if (i == 6) {
				ew.face[0].tare = ew.face[0].weight;
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
			}
		};
	},
	ele: {
		weight: function() {
			if (ew.face[0].cache.weight != ew.face[0].weight) {
				ew.face[0].cache.weight = ew.face[0].weight;
				g.setCol(0, 15);
				g.fillRect({ x: 0, y: 70, x2: 240, y2: 175, r: 10 });

				if (ew.face[0].cache.weight == "lost") {
					g.setCol(1, 13);
					g.setFont("LECO1976Regular22", 3);
					g.drawString("LOST", 120 - g.stringWidth("LOST") / 2, 100);
				}
				else {
					g.setCol(1, 0);
					g.setFont("Vector", 25);
					g.drawString("g", 220, 125); //litter
					g.setCol(1, 4);
					g.setFont("LECO1976Regular22", 3);
					g.drawString(((ew.face[0].weight - ew.face[0].tare) / 1000).toFixed(3), 110 - g.stringWidth(((ew.face[0].weight - ew.face[0].tare) / 1000).toFixed(3)) / 2, 100);
				}

			}
		},
		tare: function() {
			g.setCol(0, 15);
			//g.setFont("Vector", 14);
			g.setFont("LECO1976Regular22", 2);
			g.drawString("TARE", 70, 240);
		}
	},
	tid: -1,
	run: false,
	clear: function() {
		ew.temp.bar = 0; /*TC.removeAllListeners();*/
		if (this.tid) clearTimeout(this.tid);
		this.tid = 0;
		ew.apps.scale.state.is.bypass=0;
		return true;
	},
	off: function() {
		g.off();
		this.clear();
	}
};
