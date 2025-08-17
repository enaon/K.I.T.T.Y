// MIT License (c) 2025 enaon https://github.com/enaon
// see full license text at https://choosealicense.com/licenses/mit/

// === hx711 module from espruino repo ===
Modules.addCached("HX_711", function() {
    function c(a) {
        a = a || {};
        this.sck = a.sck;
        if (!this.sck) throw "Expecting sck";
        this.miso = a.miso;
        if (!this.miso) throw "Expecting miso";
        this.mode = a.mode || "A128";
        this.lsbGrams = a.lsbGrams || .00103123388;
        this.zero = a.zero;
        this.spi = new SPI;
        this.spi.setup({ miso: this.miso, mosi: this.sck, baud: 2E6 });
        this.sck.write(0);
        a.median && (this.median = new Int32Array(a.median));
        this.readRaw();
        a.median && this.median.fill(this.readRaw())
    }
    c.prototype.readRaw = function() {
        function a(d) {
            return (d & 128 ? 8 : 0) | (d & 32 ? 4 : 0) | (d & 8 ?
                2 : 0) | (d & 2 ? 1 : 0)
        }
        var b = { A128: 128, B32: 160, A64: 168 }[this.mode];
        if (!b) throw "Invalid mode";
        b = this.spi.send(new Uint8Array([170, 170, 170, 170, 170, 170, b]));
        b = a(b[0]) << 20 | a(b[1]) << 16 | a(b[2]) << 12 | a(b[3]) << 8 | a(b[4]) << 4 | a(b[5]);
        b & 8388608 && (b -= 16777216);
        this.median && (this.median.set(new Int32Array(this.median.buffer, 4), 0), this.median[this.median.length - 1] = b, b = new Int32Array(this.median), b.sort(), b = new Int32Array(b.buffer, 4 * (b.length >> 2), b.length >> 2), b = E.sum(b) / b.length);
        return b
    };
    c.prototype.tare = function() {
        this.zero = this.readRaw();
        ew.apps.scale.state.def.zero = this.zero;
    };
    c.prototype.calculateScale = function(a) { ew.apps.scale.state.def.lsbGrams = a / ((this.readRaw() - this.zero)); return this.lsbGrams = a / (this.readRaw() - this.zero) };
    c.prototype.readGrams = function() { return (this.readRaw() - this.zero) * this.lsbGrams };
    c.prototype.isReady = function() { return !this.miso.read() };
    c.prototype.setStandby = function(a) { this.sck.write(a) };
    c.prototype.getVariance = function() { if (!scale.median) throw Error("No Median Filter"); var a = E.sum(ew.apps.scale.median) / ew.apps.scale.median.length; return 2 * Math.sqrt(E.variance(ew.apps.scale.median, a)) * this.lsbGrams / ew.apps.scale.median.length };
    exports.connect = function(a) { return new c(a) }
});

// === scale app ===
ew.apps.scale = {
    dbg: 0,
    tid: { loop: 0, clean: 0, entry: 0 },

    // state 
    state: {
        is: { status: "off", safe: 0, bypass: 0},
        value: {
            tolerance: 400, // tolerance in grams
            sensitivity: 10, // sensitivity in grams
            base: 0,
            loop: 1000,
            counter: { event: 0, idle: 0, still: 0, noBall: 0, clean: 0, retry: 0  },
            event: { delay: 5, stillTimeout: 30 },
        },
        // logs
        log: {
            average: array => array.reduce((a, b) => a + b) / array.length,
            idle: [],
            event: [],
            still: [],
            maxEntries: 20
        },
        update: () => {
            require('Storage').write('ew_scale.json', ew.apps.scale.state.def);
        },
    },

    // mode selector
    mode: () => {
        //get current value
        if ( ew.apps.scale.state.is.bypass) {
            if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: bypass enabled");
            return;
        }
        let w = Math.round(ew.apps.scale.do.readGrams());
        ew.apps.kitty.state.is.scale.grams = w;

        // fail mode
        if (w == ew.apps.scale.state.def.lost) {
            ew.apps.kitty.state.is.scale.per = 0;

            if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: value " + w + " is the lost value, discarding");
        }
        // manual mode
        else if (ew.apps.kitty.state.is.sys.manual) {
            ew.apps.scale.state.is.status = "man";

            if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: manual mode");
        }
        // auto pause mode
        else if (ew.apps.scale.state.is.safe )
            ew.apps.scale.pause(w);
        
        // boot  mode
        else if (ew.apps.scale.state.log.idle.length <= 5) {
            ew.apps.scale.state.is.status = "init";
            ew.apps.scale.extras.loop_speed(1000);
            ew.apps.scale.state.log.idle.unshift(w);
            ew.UI.btn.ntfy(1, 4, 0, "_bar", 6, "SCALE INIT", "PLEASE WAIT", 15, 6);
            if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: we just booted, waiting to get some values");
        }
        // no ball mode
        else if (w <= ew.apps.scale.state.def.ball - 200)
            ew.apps.scale.noBall(w);
        
        // reset idle log if ball just placed 
        else if (ew.apps.scale.state.is.status === "noBall")
            ew.apps.scale.state.log.idle = [];
            
        // idle mode
        else if (Math.abs(w - ew.apps.scale.state.log.average(ew.apps.scale.state.log.idle)) < ew.apps.scale.state.value.tolerance)
            ew.apps.scale.idle.check(w);

        // event mode
        else
            ew.apps.scale.event.check(w);

        // hx711 sleep mode
        if (4000 <= ew.apps.scale.state.value.loop)
            ew.apps.scale.do.setStandby(1);

    },

    // auto pause safety feature when auto clean cycle is active 
    pause: (w) => {
        
        // pause mode not supported
        if ( !ew.apps.kitty.state.def.auto.pause ) {
            // change loop speed
            if (ew.apps.scale.state.value.loop != 8000) {
                ew.apps.scale.extras.loop_speed(8000);
                //reset idle log if side scale
                if  (ew.apps.scale.state.def.type == "side") ew.apps.scale.state.log.idle=[];
            }
            // update idle log if side scale
            if  (ew.apps.scale.state.def.type == "side") {
                // log value
                ew.apps.scale.state.log.idle.unshift(w);
                if (ew.apps.scale.state.log.maxEntries <= ew.apps.scale.state.log.idle.length) ew.apps.scale.state.log.idle.pop();
            }

            if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: auto pause is not available");
        }

        // pause mode
        else {
            // pause the toilet
            ew.apps.kitty.state.is.sys.pause = (Math.abs(w - ew.apps.scale.state.log.average(ew.apps.scale.state.log.idle)) < ew.apps.scale.state.value.tolerance) ? 0 : 1;

            // change loop speed
            if (ew.apps.scale.state.value.loop != 250) {
                ew.apps.scale.extras.loop_speed(250);

                if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: let's make the loop faster");
            }
        }
        
        ew.apps.scale.state.is.status = "clean";
    },

    // scale is idle 
    idle: {
        check: function(w) {
            // do once
            if (ew.apps.scale.state.value.loop != 5000) {
                ew.apps.scale.idle.once(w);
            }

            // get status of sand volume
            ew.apps.scale.extras.getVolume(w);
            
            // extras
            if ( ew.apps.scale.state.value.counter.idle == 10 ) {
                // turn off ball light if auto light is enabled
                if (!ew.apps.kitty.state.def.is.lid)
                    ew.apps.scale.extras.light_off();

                // close the lid if enabled
                else
                    ew.apps.scale.extras.lid_close();
            }

            // log value
            ew.apps.scale.state.log.idle.unshift(w);
            if (ew.apps.scale.state.log.maxEntries <= ew.apps.scale.state.log.idle.length) ew.apps.scale.state.log.idle.pop();

            if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: idle average :" + ew.apps.scale.state.log.average(ew.apps.scale.state.log.idle) + ", log :" + ew.apps.scale.state.log.idle);
        },

        once: function(w) {
            ew.apps.scale.state.value.counter.still = 0;
            ew.apps.scale.state.value.counter.noBall = 0;
            ew.apps.scale.state.value.counter.idle++;

            // check if event was active, if so wait ten seconds to verify this is not a false idle. 
            if (ew.apps.scale.state.value.event.delay * 3 <= ew.apps.scale.state.value.counter.event) {

                // log a presence event
                if (6 <= ew.apps.scale.state.value.counter.idle)
                    ew.apps.scale.entry(ew.apps.scale.state.value.counter.event  ,  (ew.apps.scale.state.log.average(ew.apps.scale.state.log.event) - ew.apps.scale.state.log.average(ew.apps.scale.state.log.idle) | 0));
            }
            else if (3 <= ew.apps.scale.state.value.counter.idle) {
                ew.apps.scale.extras.loop_speed(5000);
                if (ew.def.info && ew.apps.scale.state.is.status=== "init") ew.UI.btn.ntfy(1, 4, 0, "_bar", 6, "K.I.T.T.Y READY", "", 15, 6);
                ew.face.off(8000);
                ew.apps.scale.state.is.status = "idle";
                ew.apps.scale.state.value.counter.idle = 10 ;

                // reset event
                ew.apps.scale.state.value.counter.event = 0;
                ew.apps.scale.state.log.event = [];

                if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: lets slowdown things a bit, setting loop to five seconds");
            }
        }
    },

    // event is active
    event: {
        check: function(w) {
            ew.apps.scale.state.value.counter.event++;

            // do once
            if (ew.apps.scale.state.value.loop != 1000)
                ew.apps.scale.event.once(w);
                
            // get status of sand volume
            ew.apps.scale.extras.getVolume(w);

            ew.apps.scale.state.log.still.unshift(w);
            if (ew.apps.scale.state.log.maxEntries <= ew.apps.scale.state.log.still.length) ew.apps.scale.state.log.still.pop();

            if (ew.apps.scale.state.value.event.delay <= ew.apps.scale.state.value.counter.event) {

                if (Math.abs(w - ew.apps.scale.state.log.average(ew.apps.scale.state.log.still)) < ew.apps.scale.state.value.sensitivity )
                    ew.apps.scale.event.still(w);
                else
                    ew.apps.scale.event.movement(w);
            }
            
            // clear automatic clean cycle, it will be enabled on exit
            if (ew.apps.scale.state.value.event.delay * 3 == ew.apps.scale.state.value.counter.event) 
                ew.apps.scale.clean(0);
                
        },

        once: function(w) {
            // wake the screen
            
            ew.apps.scale.state.value.counter.idle = 0;
            ew.apps.scale.state.value.counter.noBall = 0;
            ew.apps.scale.state.value.counter.retry = 0 ;
            ew.apps.scale.state.log.still = [];

            ew.apps.scale.state.is.status = "event";

            // turn on ball light if auto light is enabled
            ew.apps.scale.extras.light_on();
            
            // inform
            ew.UI.btn.ntfy(1, 10, 0, "_bar", 6, "SCALE EVENT", "", 15, 6);

            // speed up
            ew.apps.scale.extras.loop_speed(1000);
            
            // get status of sand volume
            ew.apps.scale.extras.getVolume(w);

            // reschedule cleaning 
            if (ew.apps.scale.tid.clean)
                ew.apps.scale.clean(1);

            if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: speed up things a bit");
        },

        movement: function(w) {
            ew.apps.scale.state.value.counter.still = 0;
            
            //log value
            ew.apps.scale.state.log.event.unshift(w);
            if (ew.apps.scale.state.log.maxEntries <= ew.apps.scale.state.log.event.length) ew.apps.scale.state.log.event.pop();
            
           if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: movement, " + w + " is out of event log tolerance");

        },

        still: function(w) {
            ew.apps.scale.state.value.counter.still++;
            ew.apps.scale.state.value.counter.retry++;
            if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: still:",  ew.apps.scale.state.value.event.stillTimeout - ew.apps.scale.state.value.counter.still);

            // check if retying too much, maybe sensitinity is too low. 
            if ( 300 == ew.apps.scale.state.value.counter.retry)
                ew.notify.alert("error", { body: "300 TIMEOUTS", title: "SCALE ERROR" }, 0, 1);

            // turn off ball light if auto light is enabled and some time  of stillness passed.
            //if (ew.apps.scale.state.value.counter.still == ew.apps.scale.state.value.event.stillTimeout / 2 )
            //   ew.apps.scale.extras.light_off();

            // timed out
            if ( 0 == ew.apps.scale.state.value.event.stillTimeout - ew.apps.scale.state.value.counter.still)
                ew.apps.scale.event.timeout();

            else if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: there is no movement, " + w + " is within event log tolerance");
        },

        timeout: function(w) {
            
            if (!ew.apps.scale.state.log.event.length) ew.apps.scale.state.log.event = ew.apps.scale.state.log.still.slice();
             
             //check the weight, maybe it is sleeping inside
            if (ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max + 500 <= ew.apps.scale.state.log.average(ew.apps.scale.state.log.event)) {
                ew.notify.alert("error", { body: "SCALE", title: "IS A CAT SLEEPING?" }, 0, 0);
            }
            if (ew.apps.scale.state.def.type == "side")
                // log event        
                ew.apps.scale.entry(ew.apps.scale.state.value.counter.event - ew.apps.scale.state.value.event.stillTimeout + 7 , ew.apps.scale.state.log.average(ew.apps.scale.state.log.event) | 0 );

            else {
                // reset counters
                ew.apps.scale.state.value.counter.event = 0;
                ew.apps.scale.state.value.counter.still = 0;

            }
            // copy event log to idle log 
            ew.apps.scale.state.log.idle = ew.apps.scale.state.log.still.slice();
            ew.apps.scale.state.log.event = [];
            
            // turn off light
            ew.apps.scale.extras.light_off();

            if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: event timed out");
        }
    },

    // toilet ball missing 
    noBall: (w) => {
        if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: no ball is present");

        // this may be a false reading, we need to triple check
        if (ew.apps.scale.state.value.counter.noBall <= 5) {
            ew.apps.scale.state.value.counter.noBall++;
            ew.apps.scale.extras.loop_speed(1100);
            return;
        }
        // change loop speed
        ew.apps.scale.extras.loop_speed(4000);

        ew.apps.scale.state.is.status = "noBall";
        
        // reset scale
        ew.apps.scale.state.value.counter.event = 0; 
        ew.apps.scale.state.value.counter.idle = 0;
        
        // cancel cleaning
        ew.apps.scale.clean(0);
        
        // open the lid if enabled, to make cleaning easier.
        ew.apps.scale.extras.lid_open();
    },

    // extra actions
    extras: {
        lid_close: function() {
            //close the lid if enabled
            if (ew.apps.kitty.state.def.is.lid) {
                if (ew.pin.CHRG.read() && 0.3 <= ew.apps.kitty.state.is.pos.lid) {
                    if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: kitty wake up");
                    ew.apps.kitty.call.wake();
                }
                else if (0.3 <= ew.apps.kitty.state.is.pos.lid) {
                    if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: shut the lid");
                    ew.apps.kitty.call.go(ew.apps.kitty.pattern("close_lid"));
                }
                else if (!ew.pin.CHRG.read() && ew.apps.kitty.state.is.pos.lid <= 0.3) {
                    if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: kitty sleep");
                    ew.apps.kitty.call.sleep();
                }
            }
        },
        lid_open: function() {
            if (ew.apps.kitty.state.def.is.lid) {
                if (ew.pin.CHRG.read() && ew.apps.kitty.state.is.pos.lid <= 0.3) {
                    if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: kitty wake up");
                    ew.apps.kitty.call.wake();
                }
                else if (ew.apps.kitty.state.is.pos.lid <= 0.3) {
                    if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: open the lid");
                    ew.apps.kitty.call.go(ew.apps.kitty.pattern("open_lid"));
                }
                else if (!ew.pin.CHRG.read() && 0.3 <= ew.apps.kitty.state.is.pos.lid) {
                    if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: kitty sleep");
                    ew.apps.kitty.call.sleep();
                }
            }
        },
        getVolume: function(w) {
            if (ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].min <= w - ew.apps.scale.state.def.ball && w - ew.apps.scale.state.def.ball <= ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max) {
                let we = (w - ew.apps.scale.state.def.ball - ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].min) * (100 / (ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max - ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].min)) | 0;
                ew.apps.kitty.state.is.scale.alert = (we <= 0 || 100 <= we) ? 1 : 0;
                ew.apps.kitty.state.is.scale.per = we;
                if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: litter percentage :" + we + " %");
            }
            //else if (ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max + 200 <= w - ew.apps.scale.state.def.ball) {
            else if (ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max <= w - ew.apps.scale.state.def.ball) {
                ew.apps.kitty.state.is.scale.per = 100;
                ew.apps.kitty.state.is.scale.alert = 2;
                if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: litter overload");
            }
            else {
                ew.apps.kitty.state.is.scale.per = 0;
                ew.apps.kitty.state.is.scale.alert = "3";
                if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: litter is low");
            }
        },
        light_off: function() {
            if (ew.apps.kitty.state.def.auto.light && !ew.pin.CHRG.read()) {
                if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: turn off the light");
                ew.apps.kitty.call.sleep();
            }
        },
        light_on: function() {
            if (ew.apps.kitty.state.def.auto.light && ew.pin.CHRG.read()) {
                if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: turn on the light");
                ew.apps.kitty.call.wake();
            }
        },
        loop_speed: function(i) {
            ew.apps.scale.state.value.loop = i;
            if (ew.apps.scale.tid.loop)
                changeInterval(ew.apps.scale.tid.loop, i);
        }
    },

    //log the entry activity
    entry: (sec, gr) => {
        if (ew.apps.scale.tid.entry) {
            clearTimeout(ew.apps.scale.tid.entry);
            ew.apps.scale.tid.entry = 0;
            ew.notify.alert("error", { body: "ENTRY TID ACTIVE", title: "LOG ERROR" }, 0, 1);
        }

        // reset counters
        ew.apps.scale.state.value.counter = { event: 0, idle: 0, still: 0, noBall: 0, clean: 0, retry: 0 },
        ew.apps.scale.state.log.event = [];

        // scedule auto clean
        ew.apps.scale.clean(1);

        // log event
        if (ew.logger.kitty)
            ew.apps.scale.tid.entry = setTimeout(() => {
                ew.apps.scale.tid.entry = 0;
                ew.logger.kitty.logUsage("event", { "sec": sec, "gr": gr });

            }, 2500);

        else console.log("no logger script");

        if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: presence detected, a cat weighting " + gr + " grams,  used the toilet for " + sec + " seconds");
    },

    // schedule an automatic cleaning cycle
    clean: (i) => {


        if (i && ew.apps.kitty.state.def.auto.clean) {
            if (ew.apps.scale.tid.clean) {
                clearInterval(ew.apps.scale.tid.clean);
                ew.apps.scale.tid.clean = 0;
                if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: Reset auto cleaning timer");
                //if (ew.def.info) ew.UI.btn.ntfy(1, 4, 0, "_bar", 6, "AUTO CLEAN", "TIMER RESET", 0, 15);
            } else {
                if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: schedule new auto cleaning");
                if (ew.def.info) ew.UI.btn.ntfy(1, 4, 0, "_bar", 6, "AUTO CLEAN", `IN ${ew.apps.kitty.state.def.auto.delay} MINUTES`, 0, 15);
            }
            // get the time delay
            ew.apps.scale.state.value.counter.clean = ew.apps.kitty.state.def.auto.delay * 60;

            // schedule the clean cycle
            ew.apps.scale.tid.clean = setInterval(() => {
                ew.apps.scale.state.value.counter.clean--;

                if (ew.apps.scale.state.value.counter.clean === 5)
                    ew.apps.scale.state.is.safe = 1;

                else if (ew.apps.scale.state.value.counter.clean === 0) {
                    clearInterval(ew.apps.scale.tid.clean);
                    ew.apps.scale.tid.clean = 0;
                    ew.apps.scale.state.value.counter.idle = 0;
                    ew.apps.kitty.call.wake("clean");

                }

                if (ew.apps.scale.dbg || ew.dbg) console.log(`scale dbg: start cleaning in : ${ew.apps.scale.state.value.counter.clean} seconds`);
            }, 1000);
        }
        else {
            if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: cancel auto cleaning");
            if (ew.apps.scale.tid.clean) {
                clearInterval(ew.apps.scale.tid.clean);
                ew.apps.scale.tid.clean = 0;
            }
            ew.apps.scale.state.value.counter.clean = 0;
            ew.apps.scale.state.value.counter.still = 0;
        }
    },

    // get scale readings
    get: {
        ball: () => { return 1200 <= ew.apps.scale.do.readGrams() ? true : false; },
        sandGr: () => { return (ew.apps.scale.do.readGrams() - 1350); },
        sandPer: () => {
            let w = ew.apps.scale.do.readGrams() - 1350;
            if (1000 <= w && w <= 3600) {
                return ((w - 1000) * 0.03846).toFixed(0);
            }
            else if (w <= 1000)
                return "empty";
            else return "Overload";
        },
    },

    // start the scale loop
    start: () => {
        ew.apps.scale.state.is.status = "init";
        if (ew.apps.scale.tid.loop) {
            clearInterval(ew.apps.scale.tid.loop);
            if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: scale is running, restarting");
        } else if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: scale started");

        // ---- check for low battery ----
        if ( ew.is.batS <= 0){
            ew.notify.alert("error", { body: "", title: "low Battery" }, 1, 1);
            ew.apps.scale.stop("low battery");   
            return;                
        }

        ew.apps.scale.tid.loop = setInterval(() => {
            //wake if sleeping
            if (!ew.apps.scale.do.isReady()) {
                ew.apps.scale.do.setStandby(0);

                // delay to allow for hx711 wake up
                setTimeout(() => { ew.apps.scale.mode(); }, 750);
            }
            else
                ew.apps.scale.mode();

        }, ew.apps.scale.state.value.loop);
    },

    // stop the scale
    stop: (i) => {
        if (ew.apps.scale.tid.loop) {
            clearInterval(ew.apps.scale.tid.loop);
            ew.apps.scale.tid.loop = 0;
        }
        ew.apps.scale.state.is.status = "off";
        ew.apps.scale.state.value.loop = 1000;
        ew.apps.scale.clean(0);
        ew.apps.scale.state.log.idle = [];
        ew.apps.scale.do.setStandby(1);
        if (ew.apps.scale.dbg || ew.dbg) console.log("scale dbg: stopped",i || "ok");
    }
};

// === default settings ===

if (!require('Storage').readJSON('ew.json', 1).scale) {
    ew.apps.scale.state.def = {
        lsbGrams: -0.01155205218, //-0.01015218221, -0.00977332940 10+10kg, -0.01015218221 20gkr, -0.00477916473 10gkr
        zero: -449774,
        lost: -8180,
        ball: 1350,
        type: "down"
    };
    ew.do.update.settings();
} else ew.apps.scale.state.def =require('Storage').readJSON('ew.json', 1).scale;


// ---- init ----
ew.apps.scale.init = () => {
    //poke32(0x50000700 + 27 * 4, 2);
    //poke32(0x50000700 + 28 * 4, 2);
    ew.apps.scale.do = require('HX_711').connect({
        def: {},
        sck: D27,
        miso: D28,
        lsbGrams: ew.apps.scale.state.def.lsbGrams, //20 lowscale
        zero: ew.apps.scale.state.def.zero,
        //median : 16, // Enable median filter (see below, default = no filter)
        mode: "A128"
    });
};

// === startup ===

// ---- init the scale ----
ew.apps.scale.init();

// ---- set lost value and start if enabled ----
setTimeout(() => {
    ew.apps.scale.do.setStandby(1);
    setTimeout(() => {
        ew.apps.scale.state.def.lost = Math.round(ew.apps.scale.do.readGrams());
        if (ew.apps.scale.state.def.type == "side") ew.apps.kitty.state.def.auto.pause = 0;
        if (ew.apps.kitty.state.def.is.scale ) ew.apps.scale.start();
        else ew.apps.scale.stop();
           
         // ---- disable on low battery ----  
         ew.sys.on('battery', function(x){
            if (x === "low" && ew.apps.scale.state.is.status != "off" && !ew.apps.kitty.state.is.sys.pwr )
                 ew.apps.scale.stop();   
            else  if (x === "ok" && ew.apps.scale.state.is.status === "off" && ew.apps.kitty.state.def.auto.clean && ew.apps.kitty.state.def.is.scale)
                ew.apps.scale.start();
        });

    }, 100);
}, 1500);



        