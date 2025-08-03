//activity viewer

E.setFlags({ pretokenise: 1 });
ew.UI.nav.next.replaceWith(() => {
    ew.sys.buzz.nav(ew.sys.buzz.type.na);
});
ew.UI.nav.back.replaceWith(() => {
    ew.sys.buzz.nav(ew.sys.buzz.type.ok);
    ew.face.go("main", 0);
});

ew.face[0] = {
    data: { source: 0, name: 0, key: 0, key_1: 0, key_2: 0, key_3: 0, lowLimit: 0, hiLimit: 0, fields: 0, totLowField: 0, ref: 0, style: 0, lastPosition: 0 },
    run: false,
    g: g,
    offms: (ew.def.off[ew.face.appCurr]) ? ew.def.off[ew.face.appCurr] : 60000,
    init: function(o) { //{ data: "tpmsLog" + sensor, name: sensor, key: "psi", lowL: tpms.def.list[sensor].lowP, hiL: tpms.def.list[sensor].hiP });
        // variables
        this.data.key = o.key;
        this.data.key_2 = o.key_2 || 0;
        this.data.key_3 = o.key_3 || 0;
        this.data.key4 = o.key_4 || 0;
        this.data.source = ew.logger.kitty.getStats(o.source);
        this.data.fields = this.data.source.length;
        this.data.lowLimit = o.lowL || 0;
        this.data.hiLimit = o.hiL || 50;
        this.data.style = o.style || 0;
        this.data.name = o.name || "TEST";
        this.data.icon = o.icon || "infoS";
        this.data.loop = o.loop || 0;
        this.data.focus = "key";

        // UI control Start
        ew.UI.c.start(1, 1);
        ew.UI.btn.c2l("main", "_header", 4, "WEIGHT", "", 15, 0, 1);
        ew.UI.btn.c2l("main", "_header", 5, "TIME", "", 2, 0, 0.8);
        ew.UI.c.end();

        // button hander
        ew.UI.c.main._header = (i) => {
            ew.sys.buzz.nav(ew.sys.buzz.type.ok);
            if (i == 4) {
                ew.face[0].data.focus = "key";
            }
            else if (i == 5) {
                ew.face[0].data.focus = "key_2";
            }
            ew.UI.btn.c2l("main", "_header", 4, "WEIGHT", "", i == 4 ? 15: 2, i == 4 ? 0 : 0, i == 4 ? 1:0.8 );
            ew.UI.btn.c2l("main", "_header", 5, "TIME", "", i == 5 ? 15: 2, i == 5 ? 0 : 0, i == 5 ? 1:0.8);
            ew.face[0].g.setCol(0, 0);
            ew.face[0].g.fillRect({ x: 0, y: 180, x2: 240, y2: 280, });
            ew.face[0].graph(ew.face[0].data.source, ew.face[0].data.lastPosition, 0, ew.face[0].data.focus);

        };

        this.info(this.data.source[this.data.lastPosition][o.key], this.data.source[this.data.lastPosition][o.key_2], this.lowField(this.data.source[this.data.lastPosition][o.key_3]).toUpperCase(), this.data.source[this.data.lastPosition][o.key_4]);
        /*
        if (!this.data.started && ew.def.info) {
            ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "LAST 24H", "ACTIVITY", 15, 4);
            g.flip();
            this.data.started = 1;
        }
        else
        */
            this.bar();

    },
    show: function(s) {
        if (!this.run) return;
    },
    info: function(key, key_2, key_3, key_4) {
        //"ram";
        g.setCol(0, 15);
        g.fillRect({ x: 0, y: 70, x2: 235, y2: 180, r: 10 });

        /*if ( ew.def.info ) {
			g.setFont("Teletext10x18Ascii");
            g.setCol(1, 1);
            g.drawString("GRAMS", 60 - g.stringWidth("GRAMS") / 2, 75);
            g.drawString("SEC", 180 - g.stringWidth("SEC") / 2, 75);
        }
        */
        
        // values
        g.setCol(1, 4);
        g.setFont("LECO1976Regular22", 2);
        let l= g.stringWidth(key)/2;
        g.drawString(key, 60 - l, 100);
        let l2= g.stringWidth(key_2)/2;
        g.drawString(key_2, 180 - g.stringWidth(key_2) / 2, 100);
		//g.setFont("Vector", 22);
	
	    // units
		g.setFont("Teletext10x18Ascii");
        g.drawString("g", 60 + 10+ l - g.stringWidth("g") / 2, 115);
        g.drawString("s", 180 + 10+ l2 - g.stringWidth("s") / 2, 117);

        // time
        g.setCol(1, 0);
        //g.setFont("LECO1976Regular22");
        g.drawString(key_3, 120 - g.stringWidth(key_3) / 2, 156); //
        g.flip();

    },
    bar: function() {
        if (ew.is.UIpri) { ew.notify.alert("error",ew.notify.log.error[0], 1, 1);return;}
        g.setCol(0, 0);
        g.fillRect({ x: 0, y: 180, x2: 250, y2: 280, });

        // graph the bar
        ew.face[0].graph(ew.face[0].data.source, ew.face[0].data.lastPosition, 0, ew.face[0].data.focus);

        // set the bar control
        TC.val = { cur: ew.face[0].data.lastPosition, dn: 0, up: ew.face[0].data.fields - 1, tmp: 0, reverce: 0, loop: this.data.loop };
        ew.UI.c.tcBar = (a, b) => {
            //"ram";
            let v = ew.face[0].graph(ew.face[0].data.source, b, 1, ew.face[0].data.focus);
            if (!v) { return; }
            g.flip();

            // call info
            if (ew.tid.barDo) clearTimeout(ew.tid.barDo);
            ew.tid.barDo = setTimeout((v) => {
                ew.tid.barDo = 0;
                ew.face[0].info(v[0], v[1], ew.face[0].lowField(v[2]).toUpperCase(), v[3]);
            }, 25, v);
        };
        ew.temp.bar = 1;

        // reset UI control, bar only
        ew.UI.c.start(0, 1);
        ew.UI.c.end();

        // bar buttons
        ew.UI.c.bar._bar = (i) => {
            if (i == 1) {}
        };
    },
    lowField: function(o) {
        let tm = (getTime() | 0) - o;
        let ago = 0;
        if (tm < 86400) {
            if (tm < 60) ago = tm + " SEC AGO";
            else if (tm < 3600) ago = ((tm / 60) | 0) + " MIN AGO";
            else {
                ago = new Date(tm * 1000).toISOString().substr(11, 5).split(":");
                ago = Number(ago[0]) + "h " + ago[1] + "' AGO";
            }
        }
        else {
            ago = (new Date(o * 1000).toString().substr(4)).split(" ");
            ago = ago[0] + " " + ago[1] + " " + ago[3].substr(0, 5);
        }
        return (ago);
    },

    graph: function(data, pos, update, focus) {
        //"ram";
        // vars
        const width = g.getWidth() - 30;
        const bottom = g.getHeight() - 15;
        const height = bottom / (process.env.BOARD == "BANGLEJS2" ? 3.3 : 3.3) | 0;
        const value = this.data[focus ? focus : "key"];
        const fields = this.data.fields;
        const margin = 15;
        const bw = width / fields;
        if (!data[pos]) return;

        // get scale
        let scale = 0;
        for (let i in data)
            if (scale < data[i][value] - 0) scale = data[i][value];

        scale = (height - (bottom / 10)) / ((scale) ? scale : 1);
        let limits = data[pos][value] >= this.data.lowLimit && data[pos][value] <= this.data.hiLimit


        if (update) {

            // top dot - erase last
            g.setCol(1, 0);
            g.fillRect(margin + 2 + (ew.face[0].data.lastPosition * bw) + bw - 2, bottom - height + 0, margin + 2 + (ew.face[0].data.lastPosition * bw), bottom - height + 5);
            // top dot - create current
            g.setCol(1, 7);
            if (1 < fields) g.fillRect(margin + 2 + (pos * bw) + bw - 2, bottom - height + 0, margin + 2 + (pos * bw), bottom - height + 5);

            limits = data[ew.face[0].data.lastPosition][value] >= this.data.lowLimit && data[ew.face[0].data.lastPosition][value] <= this.data.hiLimit

            // style 1
            if (this.data.style) {
                // bar - clear previus 
                g.setCol(1, limits ? 4 : 14);
                g.fillRect(margin + 2 + (ew.face[0].data.lastPosition * bw) + bw - 2, bottom - (data[ew.face[0].data.lastPosition][value] * scale), margin + 2 + (ew.face[0].data.lastPosition * bw), bottom);
                // bar - highlight current
                g.setCol(1, 7);
                g.fillRect(margin + 2 + (pos * bw) + bw - 2, bottom - (data[pos][value] * scale), margin + 2 + (pos * bw), bottom);
            }
            // style 0
            else {
                //limits color coding
                g.setCol(1, limits ? 4 : 14);
                // bar - clear previus
                g.drawRect(margin + 2 + (ew.face[0].data.lastPosition * bw) + bw - 2, bottom - (data[ew.face[0].data.lastPosition][value] * scale), margin + 2 + (ew.face[0].data.lastPosition * bw), bottom);
                // bar - highlight current 
                g.setCol(1, 7);
                g.drawRect(margin + 2 + (pos * bw) + bw - 2, bottom - (data[pos][value] * scale), margin + 2 + (pos * bw), bottom);
            }

            ew.face[0].data.lastPosition = pos;
            return [data[pos][ew.face[0].data.key], data[pos][ew.face[0].data.key_2], data[pos][ew.face[0].data.key_3], data[pos][ew.face[0].data.key_4]];
        }

        // first draw
        else {
            // dot highlight current
            g.setCol(1, 15);
            if (1 < fields) g.fillRect(margin + 2 + (pos * bw) + bw - 2, bottom - height + 0, margin + 2 + (pos * bw), bottom - height + 5);

            // bar - draw bars
            for (let i in data) {
                if (fields < i) break;
                //g.setCol(1, i == pos ? limits?14:11 : limits?13:4);
                limits = data[i][value] >= this.data.lowLimit && data[i][value] <= this.data.hiLimit
                g.setCol(1, limits ? 4 : 14);
                g.fillRect(margin + 2 + (i * bw) + bw - 2, bottom - (data[i][value] * scale), margin + 2 + (i * bw), bottom);
                //g.fillRect( margin + 2 + (i * bw) + bw - 2, bottom - (data[i][value] * scale),  margin + 2 + (i * bw), bottom);
            }

            // bar - highlight curent
            g.setCol(1, 15);
            // if (this.data.style)
            //g.setCol(1, limits ? 4 : 14);
            g.fillRect(margin + 2 + (pos * bw) + bw - 2, bottom - (data[pos][value] * scale), margin + 2 + (pos * bw), bottom);
            // else 
            //    g.drawRect(margin + 2 + (pos * bw) + bw - 2, bottom - (data[pos][value] * scale), margin + 2 + (pos * bw), bottom);


        }
        //return data[pos][value];
        g.flip();
    },
    clear: function(o) {
        ew.temp.bar = 0; /*TC.removeAllListeners();*/
        if (this.tid) clearTimeout(this.tid);
        this.tid = 0;
        return true;
    },
    off: function(o) {
        g.off();
        this.clear(o);
    }
};
