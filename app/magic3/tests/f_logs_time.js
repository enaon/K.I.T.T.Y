E.setFlags({ pretokenise: 1 });
//touch
ew.UI.nav.next.replaceWith(() => {
    ew.sys.buzz.nav(ew.sys.buzz.type.na);
});
ew.UI.nav.back.replaceWith(() => {
    ew.sys.buzz.nav(ew.sys.buzz.type.ok);
    if (ew.face[0].data.name != "month" && ew.face[0].data.name != "year")
        ew.face.go('logs_time', 0, { source: "month", key: ew.face[0].data.month + 1, lowL: "0", hiL: "50", style: 1, loop: 1 });
    else ew.face.go("main", 0);
});
//simple log viewer
ew.face[0] = {
    data: { source: 0, name: 0, lowLimit: 0, hiLimit: 0, fields: 0, totLowField: 0, ref: 0, style: 0, },
    run: false,
    offms: (ew.def.off[ew.face.appCurr]) ? ew.def.off[ew.face.appCurr] : 60000,
    init: function(o) { //{ data: "tpmsLog" + sensor, name: sensor, key: "psi", lowL: tpms.def.list[sensor].lowP, hiL: tpms.def.list[sensor].hiP });
        // vars
        this.data.day = this.data.day || Date().getDate();
        this.data.year = this.data.year || Date().getFullYear();
        this.data.month = this.data.month || Date().getMonth();
        this.data.source = ew.logger.kitty.getStats(o.source, o.key ? o.key : null);
        this.data.lowLimit = o.lowL || 0;
        this.data.hiLimit = o.hiL || 50;
        this.data.style = o.style || 0;
        this.data.name = o.source || "month";
        this.data.loop = o.loop || 0; //ew.UI.btn.c0l({loc:"main",type:"_log",pos:5,txt1:this.data[this.data.lastPos],txt2:"Kph",fClr:15,bClr:6,size:2});
        this.data.monthId = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        this.data.dayId = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        this.data.pos = this.data.pos || -1;
        this.data.lastPos = this.data.lastPos || -1;

        // UI control Start
        ew.UI.c.start(1, 1); //set UI control Start
        ew.UI.ele.coord("main", "_main", 6);
        ew.UI.btn.c2l("main", "_headerL", 4, ew.face[0].data.month, "", 15, ew.face[0].data.name == "month" ? 6 : 0);
        ew.UI.btn.c2l("main", "_headerL", 5, ew.face[0].data.year, "", 15, ew.face[0].data.name == "year" ? 6 : 0);
        ew.UI.c.end();
        // UI control end



        /*

        if (o.source == "year") {
            if (o.key) this.data.year = o.key;
            g.setCol(1, 15);
            g.setFont("LECO1976Regular22");
            g.drawString(this.data.year, 120 - g.stringWidth(this.data.year) / 2, 35); //
            this.data.fields = 12;
            this.data.id = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        }
        else if (o.source == "month") {
            if (o.key) this.data.month = o.key -1 ;
            g.setCol(1, 15);
            g.setFont("LECO1976Regular22");
            txt=this.data.year+", "+this.data.monthId[this.data.month ].toUpperCase();
            g.drawString(txt, 120 - g.stringWidth(txt) / 2, 35); //
            this.data.fields = new Date(this.data.year, this.data.month , 0).getDate();
            this.data.id = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        }
        else if (o.source == "day") {
            g.setCol(1, 15);
            g.setFont("LECO1976Regular22");
            let date = new Date(this.data.year, this.data.month , this.data.pos); 
            txt=this.data.dayId[date.getDay()].toUpperCase() +" "+" "+this.data.pos+" "+this.data.monthId[this.data.month ].toUpperCase();
            g.drawString(txt, 120 - g.stringWidth(txt) / 2, 35); //
            this.data.fields = 24;
            this.data.id = (ew.def.hr24) ? ["00:00 - 01:00", "01:00 - 02:00", "02:00 - 03:00", "03:00 - 04:00", "04:00 - 05:00", "05:00 - 06:00", "06:00 - 07:00", "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00", "21:00 - 22:00", "22:00 - 23:00", "23:00 - 00:00"] : ["12:00 - 1:00 AM", "1:00 - 2:00 AM", "2:00 - 3:00 AM", "3:00 - 4:00 AM", "4:00 - 5:00 AM", "5:00 - 6:00 AM", "6:00 - 7:00 AM", "7:00 - 8:00 AM", "8:00 - 9:00 AM", "9:00 - 10:00 AM", "10:00 - 11:00 AM", "11:00 - 11:59 AM", "12:00 - 1:00 PM", "1:00 - 2:00 PM", "2:00 - 3:00 PM", "3:00 - 4:00 PM", "4:00 - 5:00 PM", "5:00 - 6:00 PM", "6:00 - 7:00 PM", "7:00 - 8:00 PM", "8:00 - 9:00 PM", "9:00 - 10:00 PM", "10:00 - 11:00 PM", "11:00 - 11:59 PM"];
            //this.data.ref = Date().getHours();
            //this.data.id[this.data.ref] = "Now";
        }

*/

        // button hander
        ew.UI.c.main._headerL = (i) => {
            ew.sys.buzz.nav(ew.sys.buzz.type.ok);
            if (i == 4) {

                ew.face[0].init({ source: "month", key: this.data.month + 1, lowL: "0", hiL: "50", style: 1, loop: 1 });
            }
            else if (i == 5) {

                ew.face[0].init({ source: "year", key: this.data.year, lowL: "0", hiL: "50", style: 1, loop: 1 });
            }

        };

        // midle area button
        ew.UI.c.main._main = (i) => {
            ew.sys.buzz.nav(ew.sys.buzz.type.ok);
            print("buton,i,name,month,year", i, ew.face[0].data.name, ew.face[0].data.month, ew.face[0].data.year)
            // intra day logs 30 days only
            if (ew.face[0].data.year != Date().getFullYear() || ew.face[0].data.month != Date().getMonth()) {
                
                ew.sys.buzz.nav(ew.sys.buzz.type.na);
                ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "30 DAYS LOG ONLY", "", 15, 13);
                return;
                //  } 
            }
        };

        this.info("total", ew.logger.kitty.getStats(o.source, o.key ? o.key : null, "total"));

        if (!this.data.started && ew.def.info) {
            ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "CLEANING CYCLES", "LOG VIEWER", 15, 4);
            this.data.started = 1;
        }
        else
            this.bar();
    },
    show: function(s) {
        if (!this.run) return;
    },
    info: function(time, value) {
        g.setCol(0, 15);
        g.fillRect({ x: 0, y: 70, x2: 235, y2: 180, r: 10 });


        //main info size
        g.setCol(1, 4);
        g.setFont("LECO1976Regular22", 3);
        let size = g.stringWidth(value) / 2;
        g.drawString(value, 80 - size, 90);

        // unit  
        //g.setFont("vector",14);
        g.setFont("Teletext10x18Ascii");
        g.drawString("Emply", 120 + size - g.stringWidth("Empty") / 2, 97);
        g.drawString("Cycles", 125 + size - g.stringWidth("Cycles") / 2, 117);

        let size2 =


            g.setCol(1, 0);
        //g.setFont("Vector",  18);
        // time info
        g.setFont("Teletext10x18Ascii");
        //g.setFont("LECO1976Regular22");
        if (time == "total") {
            let display = { "day": "daily", "month": "monthly", "year": "yearly" };
            g.drawString(display[this.data.name].toUpperCase() + " TOTAL", 120 - g.stringWidth(display[this.data.name].toUpperCase() + " TOTAL") / 2, 156);
        }
        else if (this.data.name == "month") {
            //var date = new Date();
            let date = new Date(this.data.year, this.data.month, time);
            //date.setDate(time);
            let dayOfWeek = date.getDay();
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
        this.graph(ew.face[0].data.source, ew.face[0].data.lastPos, 0, ew.face[0].data.focus);
        //set bar control
        TC.val = { cur: ew.face[0].data.lastPos, dn: 0, up: ew.face[0].data.fields - 1, tmp: 0, reverce: 0, loop: this.data.loop };
        ew.UI.c.tcBar = (a, b) => {

            if (ew.face[0].data.pos + a in ew.face[0].data.source)
                ew.face[0].data.pos = ew.face[0].data.pos + a;
            else
                ew.face[0].data.pos = ew.face[0].checkKeys(ew.face[0].data.source, ew.face[0].data.lastPos, a, this.data.loop);


            let v = ew.face[0].graph(ew.face[0].data.source, ew.face[0].data.pos, 1, ew.face[0].data.focus);
            if (!v) return;
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
            if (i == 1) {}
        };
    },
    checkKeys: function(stats, targetKey, direction, loopMode) {

        const keys = Object.keys(stats).map(Number); // [2, 3, 4, 15, 17]
        const firstKey = keys[0];
        const lastKey = keys[keys.length - 1];

        if (!loopMode) {
            if (direction === 1 && targetKey >= lastKey) return lastKey;
            if (direction === -1 && targetKey <= firstKey) return firstKey;
        }

        let resultKey = null;
        if (direction === 1) {
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] > targetKey) {
                    resultKey = keys[i];
                    break;
                }
            }
            if (resultKey === null) resultKey = loopMode ? firstKey : lastKey;
        }
        else {
            for (let i = keys.length - 1; i >= 0; i--) {
                if (keys[i] < targetKey) {
                    resultKey = keys[i];
                    break;
                }
            }
            if (resultKey === null) resultKey = loopMode ? lastKey : firstKey;
        }
        return resultKey;
    },

    graph: function(data, pos, update, focus) {
        const width = g.getWidth() - 30;
        const bottom = g.getHeight() - 15;
        const height = bottom / (process.env.BOARD == "BANGLEJS2" ? 3.3 : 3.3) | 0;
        const value = this.data[focus ? focus : "key"];
        const fields = this.data.fields;
        const margin = 15;
        const bw = width / fields;
        let scale = 0;
        for (let i in data) {
            if (scale < data[i] - 0) scale = data[i];
            this.data.totLowField += data[i];
        }
        scale = (height - (bottom / 10)) / ((scale) ? scale : 1);
        if (update) {
            // top dot - erase previus
            g.setCol(1, 0);
            g.fillRect(margin + 2 + ((ew.face[0].data.lastPos - 1) * bw) + bw - 2, bottom - height + 0, margin + 2 + ((ew.face[0].data.lastPos - 1) * bw), bottom - height + 5);
            // create current
            g.setCol(1, 15);
            g.fillRect(margin + 2 + ((pos - 1) * bw) + bw - 2, bottom - height + 0, margin + 2 + ((pos - 1) * bw), bottom - height + 5);
            // bar - clear previus
            g.setCol(1, 4);
            if (data[ew.face[0].data.lastPos]) g.drawRect(margin + 2 + ((ew.face[0].data.lastPos - 1) * bw) + bw - 2, bottom - (data[ew.face[0].data.lastPos] * scale), margin + 2 + ((ew.face[0].data.lastPos - 1) * bw), bottom);
            // highlight current 
            g.setCol(1, 14);
            g.drawRect(margin + 2 + ((pos - 1) * bw) + bw - 2, bottom - (data[pos] * scale), margin + 2 + ((pos - 1) * bw), bottom);
            print('exit graph  update: pos,lastPos:', ew.face[0].data.pos, ew.face[0].data.lastPos)

            ew.face[0].data.lastPos = pos;
            print('exit graph  update: pos,lastPos:', ew.face[0].data.pos, pos)
            return [pos, data[pos]];
        }
        else {
            g.setCol(1, 4);
            for (let i in data) {
                g.fillRect(margin + 2 + ((i - 1) * bw) + bw - 2, bottom - (data[i] * scale), margin + 2 + ((i - 1) * bw), bottom);
                pos = i;
                //g.fillRect(width - 2 - (i * bw) - bw + 2, bottom - (data[i] * scale), width - 2 - (i * bw), bottom);	
            }

            // highlight current 
            g.setCol(1, 14);
            g.drawRect(margin + 2 + ((pos - 1) * bw) + bw - 2, bottom - (data[pos] * scale), margin + 2 + ((pos - 1) * bw), bottom);
            print('exit 0 graph no update: pos,lastPos:', ew.face[0].data.pos, ew.face[0].data.lastPos)

            if (ew.face[0].data.pos == -1)
                ew.face[0].data.pos = pos;
            ew.face[0].data.lastPos = pos;

            print('exit 1 graph no update: pos:', pos)

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
