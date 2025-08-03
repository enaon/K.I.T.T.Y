E.setFlags({ pretokenise: 1 });
//touch
ew.UI.nav.next.replaceWith(() => {
    ew.sys.buzz.nav(ew.sys.buzz.type.na);
});
ew.UI.nav.back.replaceWith(() => {
    ew.sys.buzz.nav(ew.sys.buzz.type.ok);
    //if (ew.face[0].view.focus != "month" && ew.face[0].view.focus != "year")
    //   ew.face.go('f_logs_time', 0, { source: "month", key: ew.face[0].cache.monthNow + 1, lowL: "0", hiL: "50", style: 1, loop: 1 });
    //else 
    ew.face.go("main", 0);
});

//simple log viewer
ew.face[0] = {
    cache: { source: 0, style: 0, loop: 1, pos: -1, lastPos: 0 },
    run: false,
    dbg: 0,
    offms: (ew.def.off[ew.face.appCurr]) ? ew.def.off[ew.face.appCurr] : 60000,
    init: function(o) {
        // vars
        this.cache.monthsId = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        this.cache.daysId = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        this.cache.hoursId = (ew.def.hr24) ? ["00:00 - 01:00", "01:00 - 02:00", "02:00 - 03:00", "03:00 - 04:00", "04:00 - 05:00", "05:00 - 06:00", "06:00 - 07:00", "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00", "21:00 - 22:00", "22:00 - 23:00", "23:00 - 00:00"] : ["12:00 - 1:00 AM", "1:00 - 2:00 AM", "2:00 - 3:00 AM", "3:00 - 4:00 AM", "4:00 - 5:00 AM", "5:00 - 6:00 AM", "6:00 - 7:00 AM", "7:00 - 8:00 AM", "8:00 - 9:00 AM", "9:00 - 10:00 AM", "10:00 - 11:00 AM", "11:00 - 11:59 AM", "12:00 - 1:00 PM", "1:00 - 2:00 PM", "2:00 - 3:00 PM", "3:00 - 4:00 PM", "4:00 - 5:00 PM", "5:00 - 6:00 PM", "6:00 - 7:00 PM", "7:00 - 8:00 PM", "8:00 - 9:00 PM", "9:00 - 10:00 PM", "10:00 - 11:00 PM", "11:00 - 11:59 PM"];
        this.cache.data = logger.getStats();
        //
        this.view = {
            year: Date().getFullYear(),
            month: Date().getMonth(),
            day: Date().getDate(),
        };

        //find viewpoint
        let check = this.select_days()
        if (!check)
            check = this.select_months();
        if (!check)
            check = this.select_years();
        if (!check) {
            notify.alert("error", { body: "NO LOGS FOUND", title: "LOGGER ERROR" }, 0, 1);
            //ew.face.go("main", 0);
        }

        if (this.dbg) console.log("face in, view", this.view);

        // UI control Start
        ew.UI.c.start(1, 1); //set UI control Start
        ew.UI.ele.coord("main", "_main", 6);
        ew.UI.ele.coord("main", "_headerL", 4);
        ew.UI.ele.coord("main", "_headerL", 5);
        ew.UI.c.end();
        // UI control end

        // top buttons hander
        ew.UI.c.main._headerL = (i) => {
            ew.sys.buzz.nav(ew.sys.buzz.type.ok);
            if (i == 4) {
                this.select_months();

                this.display_months(1);
                this.display_years(0);

                this.info("total", this.view.total);
                this.bar();
            }
            else if (i == 5) {
                this.select_years();

                this.display_years(1);

                this.info("total", this.view.total);
                this.bar();
            }

        };

        // midle area button handler
        ew.UI.c.main._main = (i) => {
            ew.sys.buzz.nav(ew.sys.buzz.type.ok);

            switch (this.view.focus) {

                case "hours":
                    this.display_months();
                    this.display_years();
                    this.select_days();
                    this.info("total", this.view.total);
                    this.bar();
                    break;

                case "days":
                    this.display_date();
                    this.select_hours();
                    this.info("total", this.view.total);
                    this.bar();
                    break;

                case "months":
                    this.select_days();
                    this.display_months();
                    this.info("total", this.view.total);
                    this.bar();
                    break;

                case "years":
                    this.select_months();
                    this.display_months(1);
                    this.display_years(0);
                    this.info("total", this.view.total);
                    this.bar();
                    break;
            }

        };

        //draw
        this.drawFirst(0);
        this.display_years(0);
        this.display_months(0);
        this.info("total", this.view.total);

        if (!this.cache.started && ew.def.info) {
            ew.UI.btn.ntfy(1, 1.5, 0, "_bar", 6, "CLEANING CYCLES", "LOG VIEWER", 15, 1);
            this.cache.started = 1;
        }
        else {
            this.bar();
            g.flip();
        }
    },
    show: function(s) {
        if (!this.run) return;
    },

    drawFirst: function(state, value) {
        g.setCol(0, 0);
        g.fillRect({ x: 0, y: 0, x2: 240, y2: 60, r: 0 });

    },

    display_date: function(state, value) {
        g.setCol(0, 0);
        g.fillRect({ x: 0, y: 0, x2: 240, y2: 60, r: 0 });
        const txt = Date(this.view.year, this.view.month, this.view.day).toString().split(" ");
        const txt2 = (txt[0] + ", " + txt[1] + " " + txt[2] + ", " + txt[3]).toUpperCase()
        print("txt", txt2);
        const size = g.stringWidth(txt2) / 2;
        print("size", size);
        g.setCol(1, 14);
        g.setFont("LECO1976Regular22");

        g.drawString(txt2, 120 - size, 25); //litter
        g.flip();
    },


    display_years: function(state, value) {
        g.setCol(0, 0);
        g.fillRect({ x: 120, y: 0, x2: 240, y2: 60, r: 0 });
        g.setFont("LECO1976Regular22");
        g.setCol(1, state ? 15 : 3);
        const txt = state ? "YEAR" : this.view.year;
        const size = g.stringWidth(txt) / 2;
        g.drawString(txt, 120, 25); //litter
        g.setCol(1, state ? 4 : 0);
        g.fillRect({ x: 130, y: 45, x2: 130 + size * 2, y2: 50, r: 10 });
        if (state) {
            g.setCol(0, 0);
            g.fillRect({ x: 0, y: 0, x2: 120, y2: 60, r: 0 });
        }
        g.flip();
    },

    display_months: function(state, value) {
        g.setCol(0, 0);
        g.fillRect({ x: 0, y: 0, x2: 120, y2: 60, r: 0 });
        g.setFont("LECO1976Regular22");
        g.setCol(1, state ? 15 : 3);
        const txt = state ? "MONTH  " : this.cache.monthsId[this.view.month].toUpperCase() + " " + this.view.day + ", ";
        const size = g.stringWidth(txt) / 2;
        //g.drawString(txt, 60 - size, 25); //litter
        g.setFontAlign(1, -1)
        g.drawString(txt, 120, 25); //litter
        g.setCol(1, state ? 4 : 0);
        g.fillRect({ x: 110 - size * 2, y: 45, x2: 120, y2: 50, r: 10 });
        g.setFontAlign(-1, -1)
        g.flip();
    },

    select_years: function(time, value) {
        this.view.focus = "years";
        this.view.data = logger.getStats("allTime");
        this.view.fields = 10;
        this.view.reference = 2023;
        //const keys = Object.keys(this.view.data).map(Number);
        //this.cache.pos = keys[keys.length - 1];
        this.cache.pos = this.view.year;
        this.cache.lastPos = this.cache.pos;
        this.view.total = logger.getStats("allTime", "total")
        return (this.cache.pos in this.view.data);
    },

    select_months: function(time, value) {
        this.view.focus = "months";
        this.view.data = this.cache.data.years[this.view.year];
        this.view.fields = 12,
            this.view.reference = 0;
        //const keys = Object.keys(this.view.data).map(Number);
        //this.cache.pos = keys[keys.length - 1];
        this.cache.pos = this.view.month + 1;
        this.view.total = this.view.data[this.view.month + 1];
        return (this.cache.pos in this.view.data)
    },

    select_days: function(time, value) {
        this.view.focus = "days";
        this.view.data = this.cache.data.months[this.view.month + 1];
        this.view.fields = new Date(this.view.year, this.view.month, 0).getDate();
        this.view.reference = 0;

        this.cache.pos = this.position_validate();
        this.view.day = this.cache.pos;
        this.cache.lastPos = this.cache.pos;
        this.view.total = this.view.data[this.view.day];
        return (this.cache.pos in this.view.data)
    },

    select_hours: function(time, value) {

        this.view.focus = "hours";
        this.view.data = this.cache.data.dayHours[this.view.day];

        this.view.fields = 24;
        this.view.reference = 0;

        this.cache.pos = this.position_validate();
        this.cache.lastPos = this.cache.pos;
        this.view.total = this.view.data[this.cache.pos];
        return (this.cache.pos in this.view.data)
    },

    position_validate: function() {
        const keys = Object.keys(this.view.data).map(Number);
        const lastKey = keys[keys.length - 1];
        console.log("lastkey:", lastKey);
        if (lastKey === undefined) {
            notify.alert("error", { body: "NO VALID KEY", title: "LOGGER ERROR" }, 0, 1);
            return;
        }
        return lastKey;
    },

    info: function(time, value) {
        if (this.dbg) console.log("\n info in, time,value", time, value);

        g.setCol(0, 15);
        g.fillRect({ x: 0, y: 70, x2: 235, y2: 180, r: 10 });


        //main info size
        g.setCol(1, 4);
        g.setFont("LECO1976Regular22", 3);
        let size = g.stringWidth(value) / 2;
        g.drawString(value, 80 - size, 90);

        // unit  
        g.setFont("Teletext10x18Ascii");
        g.drawString("Emply", 120 + size - g.stringWidth("Empty") / 2, 97);
        g.drawString("Cycles", 125 + size - g.stringWidth("Cycles") / 2, 117);

        g.setCol(1, 0);
        g.setFont("LECO1976Regular22");

        if (time == "total") {
            let display = { "days": "daily", "months": "monthly", "years": "All Time", "hours": "hourly" };
            g.drawString(display[this.view.focus].toUpperCase() + " TOTAL", 120 - g.stringWidth(display[this.view.focus].toUpperCase() + " TOTAL") / 2, 156);
        }
        else if (this.view.focus == "days") {
            let date = new Date(this.view.year, this.view.month, time);
            let dayOfWeek = date.getDay();
            this.view.day = time;

            g.setCol(1, 0);
            g.drawString(time + " " + this.cache.daysId[dayOfWeek].toUpperCase(), 120 - g.stringWidth(time + " " + this.cache.daysId[dayOfWeek].toUpperCase()) / 2, 156); //
        }
        else if (this.view.focus == "years") {
            this.view.year = time;
            g.drawString(time, 120 - g.stringWidth(time) / 2, 156); //
        }
        else if (this.view.focus == "months") {
            this.view.month = time - 1;
            //this.display_months(1);
            g.drawString(this.cache[this.view.focus + "Id"][time - (this.view.focus == "months" ? 1 : 0)].toUpperCase(), 120 - g.stringWidth(this.cache[this.view.focus + "Id"][time - (this.view.focus == "months" ? 1 : 0)].toUpperCase()) / 2, 156); //

        }
        else
            g.drawString(this.cache[this.view.focus + "Id"][time - (this.view.focus == "months" ? 1 : 0)].toUpperCase(), 120 - g.stringWidth(this.cache[this.view.focus + "Id"][time - (this.view.focus == "months" ? 1 : 0)].toUpperCase()) / 2, 156); //

        g.flip();

    },
    bar: function() {
        //"ram";
        g.setCol(0, 0);
        g.fillRect({ x: 0, y: 180, x2: 240, y2: 280, });
        if (this.dbg) console.log("in bar, pos,lastPos", this.cache.pos, this.cache.lastPos);
        this.graph(this.view.data, this.cache.pos, 0);
        //set bar control


        TC.val = { cur: this.cache.pos, dn: this.view.reference, up: this.view.reference + this.view.fields - 1, tmp: 0, reverce: 0, loop: this.cache.loop || 1 };
        ew.UI.c.tcBar = (a, b) => {
            if (this.dbg) console.log("in ew.UI.c.tcBar, pos,lastPos", this.cache.pos, this.cache.lastPos);

            if (this.cache.pos + a in this.view.data)
                this.cache.pos = this.cache.pos + a;
            else
                this.cache.pos = this.checkKeys(this.view.data, this.cache.lastPos, a, this.cache.loop);


            let v = this.graph(this.view.data, this.cache.pos, 1);
            if (!v) {

                if (this.dbg) console.log("in bar, no v, return");
                return;

            }
            //g.flip();
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
        const keys = Object.keys(stats).map(Number);
        const firstKey = keys[0];
        const lastKey = keys[keys.length - 1];

        if (this.dbg) console.log("in checkKeys: firstKey,lastKey,targetKey,keys:", firstKey, lastKey, targetKey, keys);

        if (!loopMode || this.view.focus == 'years') {
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
            if (resultKey === null) {
                switch (this.view.focus) {

                    case "hours":
                        // (1) Ψάχνει επόμενη ώρα στην ίδια ημέρα
                        for (let i = 0; i < keys.length; i++) {
                            if (keys[i] > targetKey) {
                                resultKey = keys[i];
                                break;
                            }
                        }

                        // (2) Αν δεν βρέθηκε, ψάχνει επόμενη ημέρα με αυστηρούς ελέγχους
                        if (resultKey === null) {
                            const currentDay = Date().getDate();
                            const currentMonth = Date().getMonth();
                            let nextDay = this.view.day + 1;
                            let found = false;

                            // (2α) Έλεγχος αν είμαστε στον τρέχοντα μήνα
                            if (this.view.month === currentMonth) {
                                // Ψάχνει επόμενη ημέρα ΜΟΝΟ αν <= currentDay (για να μην πάει στο μέλλον)
                                while (nextDay <= currentDay && !found) {
                                    if (nextDay in this.cache.data.dayHours) {
                                        this.view.day = nextDay;
                                        this.view.data = this.cache.data.dayHours[this.view.day];
                                        const nextDayKeys = Object.keys(this.view.data).map(Number);
                                        resultKey = nextDayKeys[0];
                                        found = true;
                                        break;
                                    }
                                    nextDay++;
                                }
                                // Αν φτάσαμε currentDay, ΣΤΑΜΑΤΑΜΕ (δεν πάμε σε επόμενο μήνα)
                            }
                            // (2β) Βελτιστοποιημένη έκδοση
                            if (this.view.month === currentMonth) {
                                // Χρήση for loop με σαφή όρια
                                for (let d = this.view.day + 1; d <= currentDay; d++) {
                                    if (d in this.cache.data.dayHours) {
                                        this.view.day = d;
                                        this.view.data = this.cache.data.dayHours[d];
                                        resultKey = Math.min.apply( Math,Object.keys(this.view.data).map(Number));
                                        found = true;
                                        break;
                                    }
                                }
                            }
                            else {
                                const nextMonthDays = Object.keys(this.cache.data.months[(this.view.month + 1) % 12 + 1] || {}).map(Number);
                                // Χρήση find για γρηγορότερη εύρεση
                                const nextDay = nextMonthDays.find(day => day <= currentDay);
                                if (nextDay !== undefined) {
                                    this.view.month = (this.view.month + 1) % 12;
                                    this.view.day = nextDay;
                                    this.view.data = this.cache.data.dayHours[nextDay];
                                    resultKey = Math.min.apply( Math,Object.keys(this.view.data).map(Number));
                                    found = true;
                                }
                            }
                            if (found) {
                                this.display_date();
                                this.graph(this.view.data, resultKey, 0);
                            }
                            else {
                                resultKey = lastKey; // Fallback
                            }
                        }
                        break;


                    case "days":
                        // Ψάχνουμε όλους τους επόμενους μήνες
                        let nextMonthCheck = this.view.month + 1;
                        while (nextMonthCheck <= 11 && !resultKey) { // 0-11 για months
                            if ((nextMonthCheck + 1) in this.cache.data.months) { // +1 γιατί το months είναι 1-based
                                this.view.month = nextMonthCheck;
                                this.view.data = this.cache.data.months[this.view.month + 1];
                                const keysNext = Object.keys(this.view.data).map(Number);
                                resultKey = keysNext[0];
                                this.graph(this.view.data, resultKey, 0);
                                this.graph(this.view.data, resultKey, 0);

                                this.display_months();
                                this.display_years();
                                break;
                            }
                            nextMonthCheck++;
                        }
                        if (!resultKey) resultKey = lastKey;
                        break;

                    case "months":
                        // Ψάχνουμε όλα τα επόμενα έτη
                        let nextYear = this.view.year + 1;
                        while (!resultKey) {
                            if (nextYear in this.cache.data.years) {
                                this.view.year = nextYear;
                                this.view.data = this.cache.data.years[this.view.year];
                                const keysNext = Object.keys(this.view.data).map(Number);
                                resultKey = keysNext[0];
                                this.graph(this.view.data, resultKey, 0);
                                this.display_years();
                                break;
                            }
                            nextYear++;
                            // Αν φτάσουμε σε πολύ μελλοντικό έτος (π.χ. 2100), σταματάμε
                            if (nextYear > 2100) {
                                resultKey = lastKey;
                                break;
                            }
                        }
                        break;
                }
            }
        }
        else if (direction === -1) {
            // Παρόμοια λογική για την αντίθετη κατεύθυνση
            for (let i = keys.length - 1; i >= 0; i--) {
                if (keys[i] < targetKey) {
                    resultKey = keys[i];
                    break;
                }
            }
            if (resultKey === null) {
                switch (this.view.focus) {


                    case "hours":
                        // (1) Ψάχνει προηγούμενη ώρα στην ίδια ημέρα
                        for (let i = keys.length - 1; i >= 0; i--) {
                            if (keys[i] < targetKey) {
                                resultKey = keys[i];
                                break;
                            }
                        }

                        // (2) Αν δεν βρέθηκε, ψάχνει προηγούμενη ημέρα
                        if (resultKey === null) {
                            const currentDay = Date().getDate();
                            const currentMonth = Date().getMonth();
                            let prevDay = this.view.day - 1;
                            let found = false;

                            // (2α) Έλεγχος αν είμαστε στον τρέχοντα μήνα
                            if (this.view.month === currentMonth) {
                                // Ψάχνει ΟΛΕΣ τις προηγούμενες ημέρες του τρέχοντος μήνα
                                while (prevDay >= 1 && !found) {
                                    if (prevDay in this.cache.data.dayHours) {
                                        this.view.day = prevDay;
                                        this.view.data = this.cache.data.dayHours[this.view.day];
                                        const prevDayKeys = Object.keys(this.view.data).map(Number);
                                        resultKey = prevDayKeys[prevDayKeys.length - 1];
                                        found = true;
                                        break;
                                    }
                                    prevDay--;
                                }

                                // Μόνο αν φτάσαμε στο μικρότερο κλειδί (prevDay < 1) ΚΑΙ υπάρχουν ημέρες > currentDay στον προηγούμενο μήνα
                                if (!found && prevDay < 1) {
                                    const prevMonth = currentMonth - 1;
                                    if (prevMonth >= 0) {
                                        const prevMonthKey = prevMonth + 1;
                                        if (prevMonthKey in this.cache.data.months) {
                                            const daysInPrevMonth = Object.keys(this.cache.data.months[prevMonthKey]).map(Number);
                                            // Βρες τη μεγαλύτερη ημέρα > currentDay στον προηγούμενο μήνα
                                            let lastDayInPrevMonth = -1;
                                            for (let day of daysInPrevMonth) {
                                                if (day > currentDay && day > lastDayInPrevMonth) {
                                                    lastDayInPrevMonth = day;
                                                }
                                            }
                                            if (lastDayInPrevMonth !== -1) {
                                                this.view.month = prevMonth;
                                                this.view.day = lastDayInPrevMonth;
                                                this.view.data = this.cache.data.dayHours[this.view.day];
                                                const prevMonthKeys = Object.keys(this.view.data).map(Number);
                                                resultKey = prevMonthKeys[prevMonthKeys.length - 1];
                                                found = true;
                                            }
                                        }
                                    }
                                }
                            }
                            // (2β) Έλεγχος αν είμαστε στον προηγούμενο μήνα
                            else if (this.view.month < currentMonth) {
                                // Ψάχνει μόνο ημέρες > currentDay στον προηγούμενο μήνα
                                while (prevDay > currentDay && !found) {
                                    if (prevDay in this.cache.data.dayHours) {
                                        this.view.day = prevDay;
                                        this.view.data = this.cache.data.dayHours[this.view.day];
                                        const prevDayKeys = Object.keys(this.view.data).map(Number);
                                        resultKey = prevDayKeys[prevDayKeys.length - 1];
                                        found = true;
                                        break;
                                    }
                                    prevDay--;
                                }
                            }

                            if (found) {
                                this.display_date();
                                this.graph(this.view.data, resultKey, 0);
                            }
                            else {
                                resultKey = firstKey; // Fallback
                            }
                        }
                        break;
                    case "days":
                        // Ψάχνουμε όλους τους προηγούμενους μήνες
                        let prevMonthCheck = this.view.month - 1;
                        while (prevMonthCheck >= 0 && !resultKey) { // 0-11 για months
                            if ((prevMonthCheck + 1) in this.cache.data.months) { // +1 γιατί το months είναι 1-based
                                this.view.month = prevMonthCheck;
                                this.view.data = this.cache.data.months[this.view.month + 1];
                                const keysNext = Object.keys(this.view.data).map(Number);
                                resultKey = keysNext[keysNext.length - 1];
                                this.graph(this.view.data, resultKey, 0);
                                this.display_months();
                                this.display_years();
                                break;
                            }
                            prevMonthCheck--;
                        }
                        if (!resultKey) resultKey = firstKey;
                        break;

                    case "months":
                        // Ψάχνουμε όλα τα προηγούμενα έτη
                        let prevYear = this.view.year - 1;
                        while (!resultKey) {
                            if (prevYear in this.cache.data.years) {
                                this.view.year = prevYear;
                                this.view.data = this.cache.data.years[this.view.year];
                                const keysNext = Object.keys(this.view.data).map(Number);
                                resultKey = keysNext[keysNext.length - 1];
                                this.graph(this.view.data, resultKey, 0);
                                this.display_years();
                                break;
                            }
                            prevYear--;
                            // Αν φτάσουμε σε πολύ παλιό έτος (π.χ. 2000), σταματάμε
                            if (prevYear < 2000) {
                                resultKey = firstKey;
                                break;
                            }
                        }
                        break;
                }
            }
        }

        return resultKey;
    },

    graph: function(data, pos, update) {
        const width = g.getWidth() - 30;
        const bottom = g.getHeight() - 15;
        const height = bottom / (process.env.BOARD == "BANGLEJS2" ? 3.3 : 3.3) | 0;
        const fields = this.view.fields;
        const reference = this.view.reference || 0;
        if (reference) {
            pos = pos - reference;
            this.cache.lastPos = this.cache.lastPos - reference;
        }
        const margin = 15;
        const bw = width / fields;
        let scale = 0;

        if (this.dbg) console.log("graph start, data,pos,this.cache.lastPos,update: ", data, pos, this.cache.lastPos, update);
        if (this.dbg) console.log("view", this.view);

        //if (pos in data === "false" ) { print("no i , exit graph");return}; 
        for (let i in data)
            if (scale < data[i] - 0) scale = data[i];

        scale = (height - (bottom / 10)) / ((scale) ? scale : 1);

        if (this.dbg) console.log("scale : ", scale);



        if (update) {
            if (this.dbg) console.log("in graph update, pos,this.cache.lastPos: ", pos, this.cache.lastPos);

            // top dot - erase previus
            g.setCol(1, 0);
            g.fillRect(margin + 2 + ((this.cache.lastPos - 1) * bw) + bw - 2, bottom - height + 0, margin + 2 + ((this.cache.lastPos - 1) * bw), bottom - height + 5);
            // create current
            g.setCol(1, 15);
            g.fillRect(margin + 2 + ((pos - 1) * bw) + bw - 2, bottom - height + 0, margin + 2 + ((pos - 1) * bw), bottom - height + 5);
            // bar - clear previus
            g.setCol(1, 4);
            if (data[reference + this.cache.lastPos]) g.drawRect(margin + 2 + ((this.cache.lastPos - 1) * bw) + bw - 2, bottom - (data[reference + this.cache.lastPos] * scale), margin + 2 + ((this.cache.lastPos - 1) * bw), bottom);
            // highlight current 
            g.setCol(1, 14);
            g.drawRect(margin + 2 + ((pos - 1) * bw) + bw - 2, bottom - (data[reference + pos] * scale), margin + 2 + ((pos - 1) * bw), bottom);

            if (this.dbg) { console.log('exit graph update: pos,lastPos,data[pos]:', pos, this.cache.lastPos, data[reference + pos]); }

            g.flip();
            this.cache.lastPos = reference + pos;
            return [reference + pos, data[reference + pos]];
        }
        else {
            if (this.dbg) console.log('graph first draw pos, this.cache.lastpos:', pos, this.cache.lastPos);

            g.setCol(0, 0);
            g.fillRect(0, bottom - height, 240, bottom);

            //top dot
            g.setCol(1, 15);
            g.fillRect(margin + 2 + ((pos - 1) * bw) + bw - 2, bottom - height + 0, margin + 2 + ((pos - 1) * bw), bottom - height + 5);

            // bars
            g.setCol(1, 4);
            for (let i in data) {

                if (this.dbg) { console.log('graph first draw for loop: i: ', i); }


                g.fillRect(margin + 2 + ((i - reference - 1) * bw) + bw - 2, bottom - (data[i] * scale), margin + 2 + ((i - reference - 1) * bw), bottom);
                if (this.cache.pos == -1) pos = i;
                //g.fillRect(width - 2 - (i * bw) - bw + 2, bottom - (data[reference+i] * scale), width - 2 - (i * bw), bottom);	
            }

            // highlight current 
            g.setCol(1, 14);
            g.drawRect(margin + 2 + ((pos - 1) * bw) + bw - 2, bottom - (data[reference + pos] * scale), margin + 2 + ((pos - 1) * bw), bottom);

            if (this.cache.pos == -1) {
                if (this.dbg) console.log('graph first draw, this.cache.pos was -1');
                this.cache.pos = pos;
            }
            this.cache.lastPos = reference + pos;

            g.flip();


        }

        //return data[pos][value];
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
