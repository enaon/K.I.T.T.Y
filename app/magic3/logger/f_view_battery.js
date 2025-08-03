//battery viewer

ew.UI.nav.back.replaceWith(() => {
    ew.sys.buzz.nav(ew.sys.buzz.type.ok);
    ew.face[0].page = ew.face[0].page - 1;
    if (ew.face[0].page < 0) ew.face[0].page = 3;
    ew.face[0].fixed(ew.face[0].page);
    if (ew.face[0].view === "history") ew.face[0].historyView()
    g.flip();
});
ew.UI.nav.next.replaceWith(() => {
    ew.sys.buzz.nav(ew.sys.buzz.type.ok);
    ew.face[0].page = 1 + ew.face[0].page;
    if (ew.face[0].page > 3) ew.face[0].page = 0;
    ew.face[0].fixed(ew.face[0].page);
    if (ew.face[0].view === "history") ew.face[0].historyView()
    g.flip();
});

ew.face[0] = {
    data: { source: 0, graph: 0, fields: 0, style: 0, lastPosition: 0 },
    run: false,
    page: 0,
    view: "session",
    historyKeys: [ "daysLasted", "cleanCycles", "avgDailyLoss", "percentLost"],
    offms: (ew.def.off[ew.face.appCurr]) ? ew.def.off[ew.face.appCurr] : 60000,
    init: function(o) {
        ew.logger.battery.log();
        // variables
        this.data.source = ew.logger.battery.getStats();
        this.data.graph = this.data.source.dailyLevels;
        this.data.fields = this.data.graph.length;
        this.data.style = o.style ? o.style : 0;
        this.data.loop = o.loop ? o.loop : 0;
        this.data.lastPosition = this.data.fields - 1;
        // UI control Start
        ew.UI.c.start(1, 1);
        ew.UI.btn.c2l("main", "_headerS", 4, "SESSION", "", 15, 0, 0.9);
        ew.UI.btn.c2l("main", "_headerS", 5, "HISTORY", "", 2, 0, 0.7);
        ew.UI.ele.coord("main", "_main", 4);
        ew.UI.ele.coord("main", "_main", 5);

        // top buttons hander
        ew.UI.c.main._headerS = (i) => {
            ew.sys.buzz.nav(ew.sys.buzz.type.ok);
            if (i == 4) {
                this.view = "session";
                this.data.graph = this.data.source.dailyLevels;
                this.data.fields = this.data.graph.length;
                this.data.lastPosition = this.data.fields - 1;
            }
            else if (i == 5) {
                if (typeof this.data.source.history === 'string') {
                    ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "NO HISTORY YET", "", 0, 15);
                    return;
                }
                this.view = "history";
                this.data.graph = this.data.source.history.map(item => Number(item.daysLasted));
                this.data.fields = this.data.graph.length;
                this.data.lastPosition = 0;
            }

            ew.UI.btn.c2l("main", "_headerS", 4, "SESSION", "", i == 4 ? 15 : 2, i == 4 ? 0 : 0, i == 4 ? 0.9 : 0.7);
            ew.UI.btn.c2l("main", "_headerS", 5, "HISTORY", "", i == 5 ? 15 : 2, i == 5 ? 0 : 0, i == 5 ? 0.9 : 0.7);

            this.fixed(this.page);
            this.info(this.data.lastPosition + 1, this.data.graph[this.data.lastPosition]);
            this.bar();

        };

        // middle buttons hander
        ew.UI.c.main._main = (i) => {
            ew.sys.buzz.nav(ew.sys.buzz.type.ok);
            if (i === 4) {
                this.page--;
                if (this.page < 0) this.page = 3;

            }
            else {
                this.page++;
                if (3 < this.page) this.page = 0;
            }
            this.fixed(this.page);
            g.flip();
        };
        if (ew.face[0].view === "history") ew.face[0].historyView()

        this.fixed(this.page);
        this.info(this.data.lastPosition + 1, this.data.graph[this.data.lastPosition]);
        ew.UI.c.end();

        if (!this.data.started && ew.def.info) {
            ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "BATTERY LOG", "VIEWER", 15, 1);
            this.data.started = 1;
        }
        else

            this.bar();

    },
    show: function(s) {
        if (!this.run) return;
    },
    historyView: function(){
      if (this.view === "history"){
        this.data.graph = this.data.source.history.map(item => Number(item[this.historyKeys[this.page]]));
        this.graph( this.data.graph,  this.data.lastPosition, 0);
    }  
    },
    fixed: function(page) {
        //"ram";

        g.setCol(0, 15);
        g.fillRect({ x: 0, y: 50, x2: 235, y2: 150, r: 10 });
        if (this.view === "session") {
            if (page == 0) {
                ew.UI.ele.ind(1, 4, 0);
                //main info size
                g.setCol(1, 4);
                g.setFont("LECO1976Regular22", 3);
                let size = g.stringWidth(this.data.source.currentSession.predictedDaysLeft) / 2;
                g.drawString(this.data.source.currentSession.predictedDaysLeft, 80 - size, 80);

                // unit  
                g.setFont("Teletext10x18Ascii");
                g.drawString("Days", 120 + size - g.stringWidth("Days") / 2, 87);
                g.drawString("Left", 120 + size - g.stringWidth("Left") / 2, 107);
            }
            else if (page == 1) {
                ew.UI.ele.ind(2, 4, 0);
                g.setCol(1, 4);
                g.setFont("LECO1976Regular22", 3);
                let size = g.stringWidth(this.data.source.currentSession.cleanCycles) / 2;
                g.drawString(this.data.source.currentSession.cleanCycles, 80 - size, 80);

                // unit  
                g.setFont("Teletext10x18Ascii");
                g.drawString("Clean", 120 + size - g.stringWidth("Clean") / 2, 87);
                g.drawString("Cycles", 125 + size - g.stringWidth("Cycles") / 2, 107);
            }
            else if (page === 2) {
                ew.UI.ele.ind(3, 4, 0);
                g.setCol(1, 4);
                g.setFont("LECO1976Regular22", 3);
                let size = g.stringWidth(this.data.source.currentSession.dischargeRate.toFixed(1)) / 2;
                g.drawString(this.data.source.currentSession.dischargeRate.toFixed(1), 80 - size, 80);

                // unit  
                g.setFont("Teletext10x18Ascii");
                g.drawString("% Drop", 125 + size - g.stringWidth("% Drop") / 2, 87);
                g.drawString("Per Day", 130 + size - g.stringWidth("Per Day") / 2, 107);
            }
            else if (page === 3) {
                ew.UI.ele.ind(4, 4, 0);
                g.setCol(1, 0);

                g.setFont("Teletext10x18Ascii");
                //g.setFont("LECO1976Regular22", 1);
                g.drawString("START DATE:", 120 - g.stringWidth("START DATE:") / 2, 75);

                //g.setFont("LECO1976Regular22", 1);
                g.setFont("Vector", 34);
                g.setCol(1, 4);
                g.drawString(this.data.source.currentSession.startDate, 120 - g.stringWidth(this.data.source.currentSession.startDate) / 2, 100);
            }
        }
        else {
            if (page == 0) {
                ew.UI.ele.ind(1, 4, 0);
                //main info size
                g.setCol(1, 4);
                g.setFont("LECO1976Regular22", 3);
                let size = g.stringWidth(this.data.source.history[this.data.lastPosition].daysLasted) / 2;
                g.drawString(this.data.source.history[this.data.lastPosition].daysLasted, 80 - size, 80);

                // unit  
                g.setFont("Teletext10x18Ascii");
                g.drawString("Days", 120 + size - g.stringWidth("Days") / 2, 87);
                g.drawString("Lasted", 132 + size - g.stringWidth("Lasted") / 2, 107);
            }
            else if (page == 1) {
                ew.UI.ele.ind(2, 4, 0);
                g.setCol(1, 4);
                g.setFont("LECO1976Regular22", 3);
                let size = g.stringWidth(this.data.source.history[this.data.lastPosition].cleanCycles) / 2;
                g.drawString(this.data.source.history[this.data.lastPosition].cleanCycles, 80 - size, 80);

                // unit  
                g.setFont("Teletext10x18Ascii");
                g.drawString("Clean", 120 + size - g.stringWidth("Clean") / 2, 87);
                g.drawString("Cycles", 125 + size - g.stringWidth("Cycles") / 2, 107);
            }
            else if (page == 3) {
                ew.UI.ele.ind(4, 4, 0);
                g.setCol(1, 4);
                g.setFont("LECO1976Regular22", 3);
                let size = g.stringWidth(this.data.source.history[this.data.lastPosition].percentLost) / 2;
                g.drawString(this.data.source.history[this.data.lastPosition].percentLost, 80 - size, 80);

                // unit  
                g.setFont("Teletext10x18Ascii");
                g.drawString("%", 105 + size - g.stringWidth("%") / 2, 87);
                g.drawString("Lost", 125 + size - g.stringWidth("Lost") / 2, 107);
            }
            else if (page == 2) {
                ew.UI.ele.ind(3, 4, 0);
                g.setCol(1, 4);
                g.setFont("LECO1976Regular22", 3);
                let size = g.stringWidth(this.data.source.history[this.data.lastPosition].avgDailyLoss) / 2;
                g.drawString(this.data.source.history[this.data.lastPosition].avgDailyLoss, 80 - size, 80);

                // unit  
                g.setFont("Teletext10x18Ascii");
                g.drawString("% Drop", 125 + size - g.stringWidth("% Drop") / 2, 87);
                g.drawString("Per Day", 130 + size - g.stringWidth("Per Day") / 2, 107);
            }

        }

    },
    info: function(day, bat) {
        //"ram";
        g.setCol(1, 4);
        g.fillRect({ x: 0, y: 150, x2: 240, y2: 180, r: 10 });
        g.setCol(1, 15);
        g.setFont("Teletext10x18Ascii");
        if (this.view === "session") {
            if (typeof this.data.graph === 'string') return;
            g.drawString("DAY: " + day, 60 - g.stringWidth("DAY: " + day) / 2, 160); //
            g.drawString("BAT:" + bat + "%", 175 - g.stringWidth("BAT:" + bat + "%") / 2, 160); //
        }
        else {
            let txt = "from:" + this.data.source.history[this.data.lastPosition].startDate.slice(5) + " to:" + this.data.source.history[this.data.lastPosition].endDate.slice(5)
            g.drawString(txt, 120 - g.stringWidth(txt) / 2, 160);
        }
        //g.flip();

    },
    bar: function() {
        if (ew.is.UIpri) { ew.notify.alert("error",ew.notify.log.error[0], 1, 1);return;}
        g.setCol(0, 0);
        g.fillRect({ x: 0, y: 180, x2: 250, y2: 280, });

        if (this.view === "session" && (typeof this.data.graph === 'string' || this.data.graph.length < 3)) {
            g.setCol(1, 15);
            g.setFont("Teletext10x18Ascii");
            //g.setFont("LECO1976Regular22");
            g.drawString("NO DAILY DATA YET", 120 - g.stringWidth("NO DAILY DATA YET") / 2, 220);
            g.flip();

        }
        else if ( this.data.graph.length <= 1) {
            g.setCol(1, 15);
            g.setFont("Teletext10x18Ascii");
            //g.setFont("LECO1976Regular22");
            g.drawString("LAST SESSION", 120 - g.stringWidth("LAST SESSION") / 2, 220);
            g.flip();

        }
        else {
            if (this.data.graph.length <= 1) return;
            // graph the bar
            this.graph(this.data.graph, this.data.lastPosition, 0);

            // set the bar control
            ew.sys.TC.val = { cur: this.data.lastPosition, dn: 0, up: this.data.fields - 1, tmp: 0, reverce: 0, loop: this.data.loop };
            ew.UI.c.tcBar = (a, b) => {
                let v = this.graph(this.data.graph, b, 1);
                if (!v) { return; }
                this.info(v[0] + 1, v[1]);
                if (this.view === "history") this.fixed(this.page);
                g.flip();
            };
            ew.temp.bar = 1;
        }
        // reset UI control, bar only
        ew.UI.c.start(0, 1);
        ew.UI.c.end();

        // bar buttons
        ew.UI.c.bar._bar = (i) => {
            if (i == 1) {}
        };
    },

    graph: function(data, pos, update) {
        //"ram";
        // vars
        if (data.length <= 1) return;
        const width = g.getWidth() - 30;
        const bottom = g.getHeight() - 15;
        const height = bottom / 3.3 | 0;
        const fields = this.data.fields;
        const margin = 15;
        const bw = width / fields;
        if (!data[pos] || this.data.source.length === 1) return;

        // get scale
        let scale = 0;
        for (let i in data)
            if (scale < data[i] - 0) scale = data[i];

        scale = (height - (bottom / 15)) / ((scale) ? scale : 1);
        let limits = 1;
        if (update) {

            // top dot - erase last
            g.setCol(1, 0);
            g.fillRect(margin + 2 + (this.data.lastPosition * bw) + bw - 2, bottom - height + 0, margin + 2 + (this.data.lastPosition * bw), bottom - height + 5);
            // top dot - create current
            g.setCol(1, 14);

            if (1 < fields) g.fillRect(margin + 2 + (pos * bw) + bw - 2, bottom - height + 0, margin + 2 + (pos * bw), bottom - height + 5);

            // style 1
            if (this.data.style) {
                // bar - clear previus 
                g.setCol(1, limits ? 4 : 14);
                g.fillRect(margin + 2 + (this.data.lastPosition * bw) + bw - 2, bottom - (data[this.data.lastPosition] * scale), margin + 2 + (this.data.lastPosition * bw), bottom);
                // bar - highlight current
                g.setCol(1, 14);
                g.fillRect(margin + 2 + (pos * bw) + bw - 2, bottom - (data[pos] * scale), margin + 2 + (pos * bw), bottom);
            }
            // style 0
            else {
                //limits color coding
                g.setCol(1, limits ? 4 : 14);
                // bar - clear previus
                g.drawRect(margin + 2 + (this.data.lastPosition * bw) + bw - 2, bottom - (data[this.data.lastPosition] * scale), margin + 2 + (this.data.lastPosition * bw), bottom);
                // bar - highlight current 
                g.setCol(1, 14);
                g.drawRect(margin + 2 + (pos * bw) + bw - 2, bottom - (data[pos] * scale), margin + 2 + (pos * bw), bottom);
            }

            this.data.lastPosition = pos;

        }

        // first draw
        else {
            g.setCol(0, 0);
            g.fillRect({ x: 0, y: 180, x2: 250, y2: 280, });
            // dot highlight current
            g.setCol(1, 14);
            if (1 < fields) g.fillRect(margin + 2 + (pos * bw) + bw - 2, bottom - height + 0, margin + 2 + (pos * bw), bottom - height + 5);

            // bar - draw bars
            for (let i in data) {
                if (fields < i) break;
                g.setCol(1, limits ? 4 : 14);
                g.fillRect(margin + 2 + (i * bw) + bw - 2, bottom - (data[i] * scale), margin + 2 + (i * bw), bottom);
            }
            // bar - highlight curent
            g.setCol(1, 14);
            g.fillRect(margin + 2 + (pos * bw) + bw - 2, bottom - (data[pos] * scale), margin + 2 + (pos * bw), bottom);

        }

        return [pos, data[pos]];
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
