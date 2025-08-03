// MIT License (c) 2025 enaon https://github.com/enaon
// see full license text at https://choosealicense.com/licenses/mit/

//hx711 module
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
    scale.state.def.zero = this.zero;
  };
  c.prototype.calculateScale = function(a) { scale.state.def.lsbGrams = a / ((this.readRaw() - this.zero)); return this.lsbGrams = a / (this.readRaw() - this.zero) };
  c.prototype.readGrams = function() { return (this.readRaw() - this.zero) * this.lsbGrams };
  c.prototype.isReady = function() { return !this.miso.read() };
  c.prototype.setStandby = function(a) { this.sck.write(a) };
  c.prototype.getVariance = function() { if (!scale.median) throw Error("No Median Filter"); var a = E.sum(scale.median) / scale.median.length; return 2 * Math.sqrt(E.variance(scale.median, a)) * this.lsbGrams / scale.median.length };
  exports.connect = function(a) { return new c(a) }
});
//scale app
scale = {
  dbg: 0,
  tid: { loop: 0, clean: 0, entry: 0 },
  busy: 0,
  state: {
    is: { status: "init", safe: 0 },
    value: {
      tolerance: 500, //tolerance in grams
      base: 0,
      loop: 1000,
      tloop: 650,
      counter: { event: 0, idle: 0, still: 0, noBall: 0, clean: 0 },
      event: {
        delay: 5,
        minTriggerTime: 15,
        stillTimeout: 500
      },
    },
    def: {}
  },
  log: {
    average: array => array.reduce((a, b) => a + b) / array.length,
    idle: [],
    event: [],
    still: [],
    maxEntries: 20
  },
  updateSettings: () => {
    require('Storage').write('scale.json', scale.state.def);
  },
  entry: (sec, gr) => {
    if (scale.tid.entry) {
      clearTimeout(scale.tid.entry);
      scale.tid.entry = 0;
      notify.alert("error", { body: "ENTRY TID ACTIVE", title: "SCALE ERROR" }, 0, 1);
    }
    scale.tid.entry = setTimeout(() => {
      scale.tid.entry = 0;
      logger.logUsage("event", { "sec": sec, "gr": gr });
    }, 5000);
  },
  clean: (i) => {
    if (scale.tid.clean) clearInterval(scale.tid.clean);
    scale.tid.clean = 0;
    if (!ew.apps.kitty.state.def.auto.clean) {
      if (scale.dbg) console.log("auto clean is disabled");
      scale.state.value.counter.clean = 0;
      scale.state.value.counter.still = 0;
    }
    else if (i) {
      //if (ew.def.info) notify.alert("info", { body: "AUTO CLEANING", title: "SCHEDULED" }, 0, 0);
      scale.state.value.counter.clean = ew.apps.kitty.state.def.auto.delay * 60;
      scale.tid.clean = setInterval(() => {
        scale.state.value.counter.clean--;
        if (scale.dbg) console.log("start cleaning in :" + scale.state.value.counter.clean + " seconds");
        if (scale.state.value.counter.clean == 0) {
          clearInterval(scale.tid.clean);
          scale.tid.clean = 0;
          if (scale.dbg) console.log("start cleaning");
          scale.state.is.safe = 1;
          kitty.call.wake("unlock", "clean");
        }
      }, 1000);
    }
    else {
      //if (ew.def.info) notify.alert("info", { body: "AUTO CLEANING", title: "CANCELED" }, 0, 0);
      if (scale.dbg) console.log("auto clean cancelled");
      scale.state.value.counter.clean = 0;
      scale.state.value.counter.still = 0;
    }
  },
  get: {
    ball: () => { return 1200 <= scale.do.readGrams() ? true : false; },
    sandGr: () => { return (scale.do.readGrams() - 1350); },
    sandPer: () => {
      let w = scale.do.readGrams() - 1350;
      if (1000 <= w && w <= 3600) {
        return ((w - 1000) * 0.03846).toFixed(0);
      }
      else if (w <= 1000)
        return "empty";
      else return "Overload";
    },
  },
  safe: (w) => {
    if (!ew.apps.kitty.state.def.auto.pause || ew.apps.kitty.state.def.scale.type == "side") {
      if (scale.dbg) console.log("auto pause is not available");
      //change loop speed
      if (scale.state.value.loop != 8000) {
        scale.state.is.status = "off";
        scale.state.value.loop = 8000;
        changeInterval(scale.tid.loop, scale.state.value.loop);
      }
    }
    else {
      //change loop speed
      if (scale.state.value.loop != 200) {
        scale.state.value.loop = 200;
        changeInterval(scale.tid.loop, scale.state.value.loop);
        if (scale.dbg) console.log("let's make the loop faster");
      }
      scale.state.is.status = "safe";
      ew.apps.kitty.state.is.sys.pause = (Math.abs(w - scale.log.average(scale.log.idle)) < scale.state.value.tolerance / 2) ? 0 : 1;
    }
  },
  noBall: (w) => {
    if (scale.dbg) console.log("No ball is present");
    //this may be a false reading, we need to triple check
    if (scale.state.value.counter.noBall <= 1) {
      scale.state.value.counter.noBall++;
      scale.state.value.loop = 1100;
      changeInterval(scale.tid.loop, scale.state.value.loop);
      return;
    }
    scale.state.is.status = "noBall";
    scale.state.value.loop = 4000;
    changeInterval(scale.tid.loop, scale.state.value.loop);
    scale.state.value.counter.event = 0;
    scale.state.value.counter.idle = 0;
    scale.state.value.counter.still = 0;
    //open the lid if enabled, to make claning easier.
    scale.extras.lid_open();
  },
  idle: {
    check: function(w) {
      if (scale.dbg) console.log("value " + w + " within tolerance");
      //do once
      if (scale.state.value.loop != 5000) {
        scale.idle.once(w)
      }
      //close the lid if enabled
      scale.extras.lid_close(w);
      //get status of sand volume
      scale.extras.getVolume(w);
      //log value
      scale.log.idle.unshift(w);
      if (scale.log.maxEntries <= scale.log.idle.length) scale.log.idle.pop();
      if (scale.dbg) console.log("idle average :" + scale.log.average(scale.log.idle) + ", log :" + scale.log.idle);
      if (scale.dbg) console.log("\n");
    },
    once: function(w) {
      scale.state.value.counter.noBall = 0;
      scale.state.value.counter.still = 0;
      //check if event was active, if so wait five seconds to verify this is not a false idle. 
      if (scale.state.value.event.minTriggerTime <= scale.state.value.counter.event) {
        scale.state.value.counter.idle++;
        if (5 <= scale.state.value.counter.idle) {
          //ok, we now can register a presence event, we will scedule a cleaning cycle.
          if (scale.dbg) console.log("presence detected, a cat weighting " + (scale.log.average(scale.log.event) - scale.log.average(scale.log.idle) | 0) + " used the toilet for " + scale.state.value.counter.event + " seconds");
          //log the event
          //scedule auto clean
          scale.entry(scale.state.value.counter.event, (scale.log.average(scale.log.event) - scale.log.average(scale.log.idle) | 0));
          scale.state.value.counter.event = 0;
          scale.log.event = [];
          scale.clean(1);
        }
        return;
      }
      else {
        if (scale.dbg) console.log("lets slowdown things a bit, setting loop to five seconds");
        scale.state.value.loop = 5000;
        changeInterval(scale.tid.loop, scale.state.value.loop);
        scale.state.value.counter.event = 0;
        scale.log.event = [];

        //turn off ball light if auto light is enabled
        if (!ew.apps.kitty.state.def.is.lid && ew.apps.kitty.state.def.auto.light && !ew.pin.CHRG.read()) {
          if (scale.dbg) console.log("turn off the light");
          kitty.action.sleep();
        }
      }
    }
  },
  event: {
    check: function(w) {
      if (scale.dbg) console.log("value " + w + " is out of idle tolerance, something is happening");
      scale.state.value.counter.idle = 0;
      scale.state.value.counter.noBall = 0;
      //do once
      if (scale.state.value.loop != 1000) scale.event.once(w);

      //log value
      scale.log.event.unshift(w);
      if (scale.log.maxEntries <= scale.log.event.length) scale.log.event.pop();
      if (scale.dbg) console.log("event average :" + scale.log.average(scale.log.event) + ", log :" + scale.log.event);


      //wait for some values to get an idea of what is happening
      if (scale.log.event.length <= scale.state.value.event.delay) {
        if (scale.dbg) console.log("lets wait for " + (scale.state.value.event.delay - scale.log.event.length) + " seconds, to get some more values");
        //turn on ball light if auto light is enabled
        if (ew.apps.kitty.state.def.auto.light && ew.pin.CHRG.read()) {
          if (scale.dbg) console.log("turn on the light");
          kitty.call.wake();
        }
      }
      //we got some values to work with 
      else {
        scale.state.value.counter.event++;
        if (scale.dbg) console.log("ok, we got some values to work with");

        if (Math.abs(w - scale.log.average(scale.log.event)) < scale.state.value.tolerance / 2)
          scale.event.still(w);
        else
          scale.event.movement(w);
      }
      if (scale.dbg) console.log("\n");
    },
    once: function(w) {
      if (scale.dbg) console.log("idle log average " + scale.log.average(scale.log.idle) + " is now the new base value");
      scale.state.value.base = scale.log.average(scale.log.idle);
      if (scale.dbg) console.log("lets speedup things a bit, setting loop to one second");
      scale.state.value.loop = 1000;
      changeInterval(scale.tid.loop, scale.state.value.loop);
      scale.state.is.status = "event";
      //reschedule cleaning
      if (scale.tid.clean) {
        if (scale.dbg) console.log("reschedule cleaning");
        scale.clean(1);
      }
    },
    still: function(w) {
      if (scale.dbg) console.log("there is no movement, " + w + " is within event log tolerance");
      scale.state.value.counter.still++;
      if (scale.dbg) console.log("lets increase the idle event counter, if idle for over " + (scale.state.value.event.stilltimeout <= ew.apps.kitty.state.def.auto.delay * 60 - 30 ? scale.state.value.event.stilltimeout : ew.apps.kitty.state.def.auto.delay * 60 - 30) + " seconds, then asume that the cat is gone, maybe the user added some sand");
      if (scale.dbg) console.log("idle  time left: " + ((scale.state.value.event.stilltimeout <= ew.apps.kitty.state.def.auto.delay * 60 - 30 ? scale.state.value.event.stilltimeout : ew.apps.kitty.state.def.auto.delay * 60 - 30) - scale.state.value.counter.still) + " seconds");

      //turn off ball light if auto light is enabled and three minutes of stillness passed.
      if (scale.state.value.counter.still == 180 && ew.apps.kitty.state.def.auto.light && !ew.pin.CHRG.read()) {
        if (scale.dbg) console.log("turn off the light");
        kitty.action.sleep();
      }
      //timed out
      if ((scale.state.value.event.stilltimeout <= ew.apps.kitty.state.def.auto.delay * 60 - 30 ? scale.state.value.event.stilltimeout : ew.apps.kitty.state.def.auto.delay * 60 - 30) - scale.state.value.counter.still == 0) {
        if (scale.dbg) console.log("ok, event timed out");
        //check the weight, if 1/3  over the max value for the sand type, asume a cat is in the toilet, maybe it is sleeping inside
        if (scale.log.average(scale.log.event) - ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max <= ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max / 3) {
          if (scale.dbg) console.log("there is an overload, over 1/3 more that the max sand weight allowed,  asume a cat is sleeping inside, reset event idle counter");
          notify.alert("error", { body: "SCALE", title: "IS A CAT SLEEPING?" }, 0, 0);
        }
        else {
          if (scale.dbg) console.log("let's asume the user added/removed some sand and start over");
          scale.state.value.counter.event = 0;
          scale.log.idle = scale.log.event.slice();
          scale.log.event = [];
        }
        //cancel cleaning and reset event idle timeout
        scale.state.value.counter.still = 0;
        if (scale.tid.clean) {
          if (scale.dbg) console.log("cancel cleaning");
          scale.clean(0);
        }
      }
    },
    movement: function(w) {
      if (scale.dbg) console.log("we got movement, lets reset the event idle  counter");
      scale.state.value.counter.still = 0;
      //reschedule cleaning
      if (scale.tid.clean) {
        if (scale.dbg) console.log("reschedule cleaning");
        scale.clean(1);
      }
    }
  },
  extras: {
    lid_close: function(w) {
      //close the lid if enabled
      if (ew.apps.kitty.state.def.is.lid) {
        if (ew.pin.CHRG.read() && 0.3 <= ew.apps.kitty.state.is.pos.lid) {
          if (scale.dbg) console.log("wake up");
          kitty.call.wake();
        }
        else if (0.3 <= ew.apps.kitty.state.is.pos.lid) {
          if (scale.dbg) console.log("shut the lid");
          kitty.action.lid(0);
        }
        else if (!ew.pin.CHRG.read() && ew.apps.kitty.state.is.pos.lid <= 0.3) {
          if (scale.dbg) console.log("go to sleep");
          kitty.action.sleep();
        }
      }
    },
    lid_open: function(w) {
      if (ew.apps.kitty.state.def.is.lid) {
        if (ew.pin.CHRG.read() && ew.apps.kitty.state.is.pos.lid <= 0.3) {
          if (scale.dbg) console.log("wake up");
          kitty.call.wake();
        }
        else if (ew.apps.kitty.state.is.pos.lid <= 0.3) {
          if (scale.dbg) console.log("open the lid");
          kitty.action.lid(1);
        }
        else if (!ew.pin.CHRG.read() && 0.3 <= ew.apps.kitty.state.is.pos.lid) {
          if (scale.dbg) console.log("go to sleep");
          kitty.action.sleep();
        }
      }
    },
    getVolume: function(w) {
      if (ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].min <= w - scale.state.def.ball && w - scale.state.def.ball <= ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max) {
        let we = (w - scale.state.def.ball - ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].min) * (100 / (ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max - ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].min)) | 0;
        ew.apps.kitty.state.is.scale.alert = (we <= 0 || 100 <= we) ? 1 : 0;
        ew.apps.kitty.state.is.scale.per = we;
        if (scale.dbg) console.log("percentage full :" + we + " %");
      }
      //else if (ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max + 200 <= w - scale.state.def.ball) {
      else if (ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].max <= w - scale.state.def.ball) {
        ew.apps.kitty.state.is.scale.per = 100;
        ew.apps.kitty.state.is.scale.alert = 2;
        if (scale.dbg) console.log("Overload");
      }
      else {
        ew.apps.kitty.state.is.scale.per = 0;
        ew.apps.kitty.state.is.scale.alert = "3";
        if (scale.dbg) console.log("Empty");
      }
    }
  },
  start: () => {
    scale.busy = 1;
    if (scale.tid.loop) clearInterval(scale.tid.loop);
    scale.tid.loop = setInterval(() => {
      if (!scale.do.isReady()) scale.do.setStandby(0);
      setTimeout(() => {
        let w = Math.round(scale.do.readGrams());
        ew.apps.kitty.state.is.scale.grams = w;
        //fail mode
        if (w == scale.state.def.lost) {
          if (scale.dbg) console.log("value " + w + " is the lost value, discarding");
          ew.apps.kitty.state.is.scale.per = 0;
        }
        //manual 
        else if (ew.apps.kitty.state.is.sys.manual) {
          scale.state.is.status = "man";
          if (scale.dbg) console.log("manual mode");
        }
        //init mode
        else if (scale.log.idle.length <= 5) {
          scale.state.is.status = "init";
          scale.state.value.loop = 1000;
          changeInterval(scale.tid.loop, scale.state.value.loop);
          if (scale.dbg) console.log("we just booted, waiting to get some values");
          scale.log.idle.unshift(w);
        }
        //no ball mode
        else if (w <= scale.state.def.ball - 200) {
          scale.noBall(w);
        }
        //safe mode
        else if (scale.state.is.safe == 1) {
          scale.safe(w);
        }
        //idle mode
        else if (Math.abs(w - scale.log.average(scale.log.idle)) < scale.state.value.tolerance) {
          scale.state.is.status = "idle";
          scale.idle.check(w);
          //event mode
        }
        else
          scale.event.check(w);
        //set hx711 to sleep mode
        if (4000 <= scale.state.value.loop) {
          scale.state.value.tloop = 650;
          scale.do.setStandby(1);
        }
        else scale.state.value.tloop = 10;
      }, scale.state.value.tloop);
    }, scale.state.value.loop);
  },
  stop: () => {
    scale.state.is.status = "off";
    scale.busy = 0;
    if (scale.tid.loop) clearInterval(scale.tid.loop);
    scale.tid.loop = 0;
    scale.clean(0);
    scale.log.idle = [];
    scale.do.setStandby(1);
  },
  sleep: () => {
    scale.do.setStandby(1);
  }
};
//default settings
if (!require('Storage').read("scale.json")) {
  scale.state.def = {
    lsbGrams: -0.01155205218, //-0.01015218221, -0.00977332940 10+10kg, -0.01015218221 20gkr, -0.00477916473 10gkr
    zero: -449774,
    lost: -8180,
    ball: 1350
  };
  scale.updateSettings();
}
else scale.state.def = require('Storage').readJSON("scale.json");
//init
scale.init = () => {
  poke32(0x50000700 + 27 * 4, 2);
  poke32(0x50000700 + 28 * 4, 2);
  scale.do = require('HX_711').connect({
    def: {},
    sck: D27,
    miso: D28,
    lsbGrams: scale.state.def.lsbGrams, //20 lowscale
    zero: scale.state.def.zero,
    //median : 16, // Enable median filter (see below, default = no filter)
    mode: "A128"
  });
};
//start the scale and set lost value.
scale.init();
setTimeout(() => {
  scale.do.setStandby(1);
  setTimeout(() => {
    scale.state.def.lost = Math.round(scale.do.readGrams());
    scale.updateSettings();
    if (ew.apps.kitty.state.def.is.scale) scale.start();
    else scale.do.setStandby(1);
  }, 100);
}, 1500);
