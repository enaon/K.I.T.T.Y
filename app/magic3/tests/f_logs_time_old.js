E.setFlags({ pretokenise: 1 });
//touch
//ew.face.go('f_logs_time', 0, { source: "day", name: "YEAR", lowL: "0", hiL: "50", style: 1, loop: 0, fields: 12 });
ew.UI.nav.next.replaceWith(() => {
    ew.sys.buzz.nav(ew.sys.buzz.type.na);
});
ew.UI.nav.back.replaceWith(() => {
    ew.sys.buzz.nav(ew.sys.buzz.type.ok);
    if (ew.face[0].data.name == "day")
        ew.face.go('f_logs_time', 0, { source: "month", lowL: "0", hiL: "50", style: 1, loop: 0 });
    else ew.face.go("main", 0);
});
//simple log viewer
ew.face[0] = {
    data: { pos: 1, source: 0, name: 0, lowLimit: 0, hiLimit: 0, fields: 0, totLowField: 0, ref: 0, style: 0, lastPosition: 0 },
    run: false,
    offms: (ew.def.off[ew.face.appCurr]) ? ew.def.off[ew.face.appCurr] : 60000,
    init: function(o) { //{ data: "tpmsLog" + sensor, name: sensor, key: "psi", lowL: tpms.def.list[sensor].lowP, hiL: tpms.def.list[sensor].hiP });
        this.data.day = Date().getDate();
        this.data.year = Date().getFullYear();
        this.data.source = logger.getStats(o.source, o.key ? o.key : null);
        this.data.lowLimit = o.lowL ? o.lowL : 0;
        this.data.hiLimit = o.hiL ? o.hiL : 50;
        this.data.style = o.style ? o.style : 0;
        this.data.name = o.source;
        this.data.icon = o.icon ? o.icon : "infoS";
        this.data.loop = o.loop ? o.loop : 0; //ew.UI.btn.c0l({loc:"main",type:"_log",pos:5,txt1:this.data[this.data.lastPosition],txt2:"Kph",fClr:15,bClr:6,size:2});
        this.data.monthId = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        ew.UI.c.start(1, 1); //set UI control Start
        ew.UI.ele.coord("main", "_header", 1);
        ew.UI.ele.coord("main", "_header", 2);
        ew.UI.ele.coord("main", "_header", 3);
        ew.UI.ele.coord("main", "_main", 6);
        ew.UI.c.end(); //set UI control end
        ew.UI.c.main._header = (i) => {
            ew.sys.buzz.nav(ew.sys.buzz.type.ok);
            if (i == 2) {
                if (ew.face[0].data.name == "year")
                    ew.face.go('f_logs_time', 0, { source: "month", lowL: "0", hiL: "50", style: 1, loop: 0 });
                else if (ew.face[0].data.name == "month")
                    ew.face.go('f_logs_time', 0, { source: "year", lowL: "0", hiL: "50", style: 1, loop: 0 });
            }
            if (i == 3) {
                if (o.source == "year") {
                    if (Object.keys(logger.getStats("year", ew.face[0].data.year + 1)).length == 0) {
                        ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "NO LOGS FOR " + (ew.face[0].data.year + 1), "", 15, 13);
                        g.flip();
                    }
                    else {
                        ew.face[0].data.year++
                            ew.face.go('f_logs_time', 0, { source: "year", key: ew.face[0].data.year, lowL: "0", hiL: "50", style: 1, loop: 0 });
                    }
                }
                else if (o.source == "month") {
                    if (Object.keys(logger.getStats("month", ew.face[0].data.month + 2)).length == 0) {
                        ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "NO LOGS  " + (ew.face[0].data.monthId[ew.face[0].data.month+1]).toUpperCase(), "", 15, 13);
                        g.flip();
                    }
                    else {
                        ew.face[0].data.month++
                            ew.face.go('f_logs_time', 0, { source: "month", key: ew.face[0].data.month+1, lowL: "0", hiL: "50", style: 1, loop: 0 });
                    }
                }
            }
            if (i == 1) {
                if (o.source == "year") {
                    if (Object.keys(logger.getStats("year", ew.face[0].data.year - 1)).length == 0) {
                        ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "NO LOGS FOR " + (ew.face[0].data.year - 1), "", 15, 13);
                        g.flip();
                    }
                    else {
                        ew.face[0].data.year--
                            ew.face.go('f_logs_time', 0, { source: "year", key: ew.face[0].data.year, lowL: "0", hiL: "50", style: 1, loop: 0 });
                    }
                }
                else if (o.source == "month") {
                    if (Object.keys(logger.getStats("month", ew.face[0].data.month )).length == 0) {
                        ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "NO LOGS  " + (ew.face[0].data.monthId[ew.face[0].data.month-1]).toUpperCase(), "", 15, 13);
                        g.flip();
                    }
                    else {
                        ew.face[0].data.month--;
                        ew.face.go('f_logs_time', 0, { source: "month", key: ew.face[0].data.month+1, lowL: "0", hiL: "50", style: 1, loop: 0 });

                    }
                }
            }
        };
        g.setCol(0, 0);
        g.fillRect({ x: 0, y: 0, x2: 240, y2: 70 });
        g.setCol(1, 15);
        g.setFont("LECO1976Regular22");
        g.drawString(this.data.name.toUpperCase(), 120 - g.stringWidth(this.data.name.toUpperCase()) / 2, 15); //

        if (o.source == "year") {
            g.setCol(1, 15);
            g.setFont("LECO1976Regular22");
            g.drawString(this.data.year, 120 - g.stringWidth(this.data.year) / 2, 40); //
            this.data.fields = 12;
            this.data.id = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            ew.UI.c.main._main = (i) => {
                ew.sys.buzz.nav(ew.sys.buzz.type.ok);
                if (i == 6) {
                    ew.face.go('f_logs_time', 0, { source: "month", key: ew.face[0].data.pos, name: "YEAR", lowL: "0", hiL: "50", style: 1, loop: 0, fields: 12 });
                }
            };
        }
        else if (o.source == "month") {
            if (o.key) this.data.month=o.key-1;
            g.setCol(1, 15);
            g.setFont("LECO1976Regular22");
            g.drawString(this.data.monthId[this.data.month].toUpperCase(), 120 - g.stringWidth(this.data.monthId[this.data.month].toUpperCase()) / 2, 40); //
            this.data.fields = new Date(this.data.year, this.data.month, 0).getDate();
            this.data.id = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            ew.UI.c.main._main = (i) => {
                ew.sys.buzz.nav(ew.sys.buzz.type.ok);
                if (i == 6) {
                    ew.face.go('f_logs_time', 0, { source: "day", key: ew.face[0].data.pos, name: "YEAR", lowL: "0", hiL: "50", style: 1, loop: 0, fields: 12 });
                }
            };
        }
        else if (o.source == "day") {
            this.data.fields = 24;
            this.data.id = (ew.def.hr24) ? ["00:00 - 01:00", "01:00 - 02:00", "02:00 - 03:00", "03:00 - 04:00", "04:00 - 05:00", "05:00 - 06:00", "06:00 - 07:00", "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00", "21:00 - 22:00", "22:00 - 23:00", "23:00 - 00:00"] : ["12:00 - 1:00 AM", "1:00 - 2:00 AM", "2:00 - 3:00 AM", "3:00 - 4:00 AM", "4:00 - 5:00 AM", "5:00 - 6:00 AM", "6:00 - 7:00 AM", "7:00 - 8:00 AM", "8:00 - 9:00 AM", "9:00 - 10:00 AM", "10:00 - 11:00 AM", "11:00 - 11:59 AM", "12:00 - 1:00 PM", "1:00 - 2:00 PM", "2:00 - 3:00 PM", "3:00 - 4:00 PM", "4:00 - 5:00 PM", "5:00 - 6:00 PM", "6:00 - 7:00 PM", "7:00 - 8:00 PM", "8:00 - 9:00 PM", "9:00 - 10:00 PM", "10:00 - 11:00 PM", "11:00 - 11:59 PM"];
            this.data.ref = Date().getHours();
            this.data.id[this.data.ref] = "Now";
            ew.UI.c.main._main = (i) => {
                ew.sys.buzz.nav(ew.sys.buzz.type.ok);
                if (i == 6) {
                    print("pos:", ew.face[0].data.pos)
                    ew.face.go('f_logs_time', 0, { source: "month", name: "YEAR", lowL: "0", hiL: "50", style: 1, loop: 0, fields: 12 });
                }
            };

        }
        this.info("total", logger.getStats(o.source, o.key ? o.key : null, "total"));
        this.bar();
    },
    show: function(s) {
        if (!this.run) return;
    },
    info: function(time, value) {

        g.setCol(0, 15);
        g.fillRect({ x: 0, y: 70, x2: 235, y2: 180, r: 10 });

        g.setCol(1, 4);
        g.setFont("LECO1976Regular22", 3);
        g.drawString(value, 120 - g.stringWidth(value) / 2, 90);
        g.setCol(1, 0);
        //g.setFont("Vector",  18);
        g.setFont("LECO1976Regular22");
        if (time == "total") {
            g.drawString("TOTAL THIS " + this.data.name.toUpperCase(), 120 - g.stringWidth("TOTAL THIS " + this.data.name.toUpperCase()) / 2, 156);
        }
        else if (this.data.name == "month") {

            var date = new Date();
            date.setDate(time);
            var dayOfWeek = date.getDay();
            g.setCol(1, 0);
            g.drawString(time + " " + this.data.id[dayOfWeek].toUpperCase(), 120 - g.stringWidth(time + " " + this.data.id[dayOfWeek].toUpperCase()) / 2, 156); //
        }
        else
            g.drawString(this.data.id[time - (this.data.name == "year" ? 1 : 0)].toUpperCase(), 120 - g.stringWidth(this.data.id[time - (this.data.name == "year" ? 1 : 0)].toUpperCase()) / 2, 156); //
        g.flip();
    },
    bar: function() {
        //"ram";
        g.setCol(0, 0);
        g.fillRect({ x: 0, y: 180, x2: 240, y2: 280, });
        this.graph(ew.face[0].data.source, ew.face[0].data.lastPosition, 0, ew.face[0].data.focus);
        //set bar control
        TC.val = { cur: ew.face[0].data.lastPosition, dn: 0, up: ew.face[0].data.fields - 1, tmp: 0, reverce: 0, loop: this.data.loop };
        ew.UI.c.tcBar = (a, b) => {
            if (a == 1 && ew.face[0].data.pos < ew.face[0].data.fields) {
                ew.face[0].data.pos++;
                while (!ew.face[0].data.source[ew.face[0].data.pos]) {
                    print("in while: ", ew.face[0].data.fields, ew.face[0].data.pos)
                    if (ew.face[0].data.fields < ew.face[0].data.pos) { ew.face[0].data.pos = ew.face[0].data.lastPosition; return; }
                    ew.face[0].data.pos++;
                    if (ew.face[0].data.fields < ew.face[0].data.pos) ew.face[0].data.pos = 0;
                }
            }
            else if (0 < ew.face[0].data.pos) {
                ew.face[0].data.pos--;
                while (!ew.face[0].data.source[ew.face[0].data.pos]) {
                    print("in while: ", ew.face[0].data.fields, ew.face[0].data.pos)
                    if (ew.face[0].data.pos < 0) { ew.face[0].data.pos = ew.face[0].data.lastPosition; return; }
                    ew.face[0].data.pos--;
                    if (ew.face[0].data.pos < 0) ew.face[0].data.pos = ew.face[0].data.fields - 1;
                }
            }
            let v = ew.face[0].graph(ew.face[0].data.source, ew.face[0].data.pos - 1, 1, ew.face[0].data.focus);
            if (!v) { print("no v"); return; }
            g.flip();
            if (ew.tid.barDo) clearTimeout(ew.tid.barDo);
            ew.tid.barDo = setTimeout((v) => {
                ew.tid.barDo = 0;
                ew.face[0].info(v[0], v[1]);
            }, 25, v);
        };
        ew.temp.bar = 1;
        ew.UI.c.start(0, 1);
        ew.UI.c.end();
        ew.UI.c.bar._bar = (i) => {
            //print("bar");
            if (i == 1) {}
        };
    },
    graph: function(data, pos, update, focus) {
        //print(data, pos)
        let width = g.getWidth() - 30;
        let bottom = g.getHeight() - 15;
        let height = bottom / (process.env.BOARD == "BANGLEJS2" ? 3.3 : 3.3) | 0;
        let value = this.data[focus ? focus : "key"];
        let fields = this.data.fields;
        let scale = 0;
        let margin = 15;
        if (!data[pos] && this.data.type == "activity") return;
        else pos = pos + 1;
        let bw = width / fields;
        for (let i in data) {
            if (scale < data[i] - 0) scale = data[i];
            this.data.totLowField += data[i];
        }
        scale = (height - (bottom / 10)) / ((scale) ? scale : 1);
        if (update) {
            print("in update: ", data, "last position:", ew.face[0].data.lastPosition, "position:", pos, "\n")
            g.setCol(1, 4);
            if (data[ew.face[0].data.lastPosition]) g.drawRect(margin + 2 + ((ew.face[0].data.lastPosition - 1) * bw) + bw - 2, bottom - (data[ew.face[0].data.lastPosition] * scale), margin + 2 + ((ew.face[0].data.lastPosition - 1) * bw), bottom);
            g.setCol(1, 0);
            g.fillRect(margin + 2 + ((ew.face[0].data.lastPosition - 1) * bw) + bw - 2, bottom - height + 0, margin + 2 + ((ew.face[0].data.lastPosition - 1) * bw), bottom - height + 5);
            g.setCol(1, 15);
            if (data[pos]) g.drawRect(margin + 2 + ((pos - 1) * bw) + bw - 2, bottom - (data[pos] * scale), margin + 2 + ((pos - 1) * bw), bottom);
            g.setCol(1, 3);
            ew.face[0].data.lastPosition = pos;
            return [pos, data[pos]];
        }
        else {
            g.setCol(0, 0);
            g.setCol(1, 4);
            for (let i in data) {
                g.fillRect(margin + 2 + ((i - 1) * bw) + bw - 2, bottom - (data[i] * scale), margin + 2 + ((i - 1) * bw), bottom);
            }
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
