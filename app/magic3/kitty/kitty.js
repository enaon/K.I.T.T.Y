// MIT License (c) 2024 enaon https://github.com/enaon
// see full license text at https://choosealicense.com/licenses/mit/

E.setConsole(Bluetooth, { force: true });
pinMode(D13, "opendrain_pullup", true); // ball servo pin
pinMode(D46, "opendrain_pullup", true); // lock servo pin
pinMode(D27, "output", true); // sck hx711-lid servo pin
pinMode(D38, "output"); // powerbank control pin


// === main app ===
ew.apps.kitty = {
  state: {
    is: {
      sys: { busy: 0, run: 0, pause: 0, tap: 0, pwr: 0, cnt: 0, abort: 0 },
      auto: { uvc: 0 },
      pos: { lock: 1, ball: 0.45, lid: 0.05, flip: 0, dir: 0 },
      volt: { drop: 0, base: 0, min: 0, failed: 0 },
      scale: {
        grams: 0,
        per: 0,
        alert: 0,
        idle: 0,
        last: {}
      },
      vibrator: { connected: 0, battery: 0 },
      tof: { dist: 0, per: 0, state: "na" }
    },
    msg: function(i) {
      if (i.type === "error") {
        ew.notify.alert("error", { body: i.body || "", title: i.title }, i.alert, i.persist);
        console.log("kitty error: ", i.title, i.body || "");
      }
      else {
        ew.notify.alert("info", { body: i.body || "", title: i.title }, i.alert, i.persist);

        if (ew.apps.kitty.dbg || ew.dbg) console.log("kitty dbg: ", i.title);
      }
      if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString(i.title), notify: true } } });

    },
    BLE_send: function() {
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "lt=" + ew.apps.kitty.state.is.tof.per, notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "rtod=" + ew.apps.kitty.state.is.sys.run, notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "rtot=" + (ew.apps.kitty.state.is.sys.run + ew.apps.kitty.state.def.is.total), notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "ps=" + ew.apps.kitty.state.is.sys.pause, notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "sp=" + ew.apps.kitty.state.def.is.sandType, notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "ss=" + (19 - (ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].speed * 10)), notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "ac=" + ew.apps.kitty.state.def.auto.clean, notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "ad=" + ew.apps.kitty.state.def.auto.delay, notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "au=" + ew.apps.kitty.state.def.auto.uvc, notify: true } } });
      //NRF.updateServices({ 0xffa0: { 0xffa2: { value: "vp=" + ew.is.ondcVoltage(), notify: true } } });
      //NRF.updateServices({ 0xffa0: { 0xffa2: { value: "pp=" + ew.is.ondcVoltage(1), notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "vc=" + ew.sys.batt(), notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "dt=" + Date().toString().split(' ')[4], notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "pwr=" + ew.apps.kitty.state.is.sys.pwr, notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "busy=" + ew.apps.kitty.state.is.sys.busy, notify: true } } });
    },

    isOnBase: function() {
      if (ew.apps.kitty.tof(1) == "sensor lost" && ew.apps.kitty.state.def.is.tof) {
        ew.apps.kitty.state.msg({ "type": "info", title: "Base not found", "persist": 0 });
        ew.tid.kittyT = setTimeout(() => {
          ew.tid.kittyT = 0;
          ew.apps.kitty.call.sleep();
        }, 2000);
        return false;
      }
      else return true;
    },
    update: function() { require('Storage').write('ew_kitty.json', ew.apps.kitty.state.def); }
  },

  vibrator: {
    device: 0,
    active: 0,
    connect: (x) => {
      if(ew.apps.kitty.state.is.vibrator.connected) {
        ew.apps.kitty.state.msg({ "type": "info", "title": "VIBRATOR", "body": "IS CONNECTED", "persist": 0 });
        return;
      }

      NRF.requestDevice({ timeout: 5000, filters: [{ namePrefix: 'eL-' + ew.def.name + '-V' }] }).then(function(device) {
        return require("bleuart").connect(device);
      }).then(function(device) {
        ew.apps.kitty.vibrator.device = device;
        ew.apps.kitty.state.is.vibrator.connected = 1;
        if (ew.face[0].page == "more1")
            	ew.UI.btn.c2l("main", "_2x3", 1, "VIB", (ew.apps.kitty.state.def.is.vibrator && ew.apps.kitty.state.is.vibrator.connected) ? ew.apps.kitty.state.is.vibrator.battery : "", 15, ew.apps.kitty.state.def.is.vibrator ? ew.apps.kitty.vibrator.active ? 13 : 4 : 1);
        //device.on('data', function(d) { print("Got:"+JSON.stringify(d)); });
      }).catch(function () {
        ew.apps.kitty.state.is.vibrator.connected = 0;
        ew.apps.kitty.state.msg({ "type": "error", "title": "VIBRATOR", "body": "NOT FOUND", "persist": 0 });
      });
    },
    disconnect: (x) => {
      try { ew.apps.kitty.vibrator.device.disconnect(); }
      catch (error) {
        ew.apps.kitty.state.msg({ "type": "error", "title": "VIBRATOR", "body": "DISCONNECT ERROR", "persist": 0 });
      }
      ew.apps.kitty.state.is.vibrator.connected = 0;
      if (ew.face[0].page == "more1")
            	ew.UI.btn.c2l("main", "_2x3", 1, "VIB", (ew.apps.kitty.state.def.is.vibrator && ew.apps.kitty.state.is.vibrator.connected) ? ew.apps.kitty.state.is.vibrator.battery : "", 15, ew.apps.kitty.state.def.is.vibrator ? ew.apps.kitty.vibrator.active ? 13 : 4 : 1);
    },
    write: (action, repeat) => {
      ew.apps.kitty.vibrator.active = action == "turnOn" ? 1 : 0;
      ew.apps.kitty.vibrator.device.write(`powerbank.${action}(1,${repeat});\n`).catch(function () {
        ew.apps.kitty.state.msg({ "type": "error", "title": "VIBRATOR", "body": "IS BUSY", "persist": 0 });
      });
    }
  },

  tof: function(silent) {
    let t = ew.apps.ToF.read();
    let msg = 0;
    ew.apps.kitty.state.is.tof.dist = t;
    if (ew.pin.CHRG.read()) {
      ew.apps.kitty.state.is.tof.state = "no power";
      msg = "ToF no power";
    }
    else if (t == ew.apps.kitty.state.def.tof.lost) {
      ew.apps.kitty.state.is.tof.state = "sensor lost";
      msg = "ToF sensor Error";
    }
    else if (ew.apps.kitty.state.def.tof.empty <= t) {
      ew.apps.kitty.state.is.tof.state = "waste bin missing";
      msg = "No Drawer";
    }
    else if (ew.apps.kitty.state.def.tof.full <= t) {
      ew.apps.kitty.state.is.tof.state = "ok";
      let tt = (t - ew.apps.kitty.state.def.tof.full) * (100 / (ew.apps.kitty.state.def.tof.empty - ew.apps.kitty.state.def.tof.full)) | 0;
      ew.apps.kitty.state.is.tof.per = 100 - tt;
      msg = "Waste bin: " + tt + " %";
    }
    else {
      ew.apps.kitty.state.is.tof.state = "wrong ball possition";
      msg = "ToF too low";
    }
    if (!silent && msg) ew.apps.kitty.state.msg({ "type": "info", "title": msg, "persist": 0 });
    return ew.apps.kitty.state.is.tof.state;
  },

  // --- action functions ----
  call: {

    servo: function(pin, pos, range) {
      const i = range ? 0.5 : 1;
      if (pos <= 0) pos = 0;
      if (1 / i <= pos) pos = 1 / i;
      //console.log("pos:"+pos);
      analogWrite(pin, (i + pos) / 50.0, { freq: 20, soft: false });
    },

    recovery: function(i) {
      if (ew.tid.kittyI) {
        clearInterval(ew.tid.kittyI);
        ew.tid.kittyI = 0;
      }
      pinMode(D46, "opendrain_pullup", true); // lock servo pin
      
      ew.apps.kitty.state.msg({ "type": "error", "title": "RECOVERY", "persist": 1 });

      //if ( ew.apps.kitty.state.def.is.voltMon && (ew.sys.batt() <= ew.apps.kitty.state.def.is.fail || ew.apps.kitty.state.is.sys.abort)) {
      if (ew.tid.kittyT) clearTimeout(ew.tid.kittyT);
      ew.tid.kittyT = setTimeout(() => {
        ew.tid.kittyT = 0;
        ew.apps.kitty.call.wake("recovery");
      }, 1500);
    },

    exit: function(i) {
      if (ew.tid.kittyI) {
        clearInterval(ew.tid.kittyI);
        ew.tid.kittyI = 0;
      }

      if (i.act == "Return" && ew.apps.kitty.state.def.auto.uvc) ew.apps.kitty.state.is.auto.uvc = 1;

      // ---- log waste drawer level ----
      if (i.act == "ToF") {
        let t = 100 - (ew.apps.kitty.state.is.tof.dist - ew.apps.kitty.state.def.tof.full) * (100 / (ew.apps.kitty.state.def.tof.empty - ew.apps.kitty.state.def.tof.full)) | 0;
        ew.apps.kitty.state.is.tof.per = Math.min(100, Math.max(0, t));
        if (ew.logger.kitty) ew.logger.kitty.logUsage("waste", ew.apps.kitty.state.is.tof.per);

        if (90 <= t) ew.apps.kitty.state.msg({ "type": "error", "title": "Waste bin Full", "persist": 1 });
      }

      // ---- release lid servo ----
      if (ew.apps.kitty.state.def.is.lid && i.act && i.act.includes("Lid")) {
        ew.apps.scale.state.is.bypass=0;
        pinMode(i.pin.lid, "input"); //release servo
        pinMode(i.pin.lid, "output", true);
        if (!ew.apps.kitty.state.def.is.scale) digitalWrite(i.pin.lid, 1, 100); //set hx711 to sleep mode
      }

      // ---- run next patern ----
      if (i.next) setTimeout(() => {
        if (i.next === "sleep")
          ew.apps.kitty.call.sleep();
        else
          ew.apps.kitty.call.go(ew.apps.kitty.pattern(i.next));

      }, i.hold ? i.hold * 1000 : 200);

    },

    move: function(i) {
      /// ---- do not put too much force on the lock ----
      if ((i.act == "Secure" || i.act == "Release") && 0.05 <= ew.apps.kitty.state.is.volt.base - ew.sys.batt() && ew.apps.kitty.state.is.pos.flip == 1) {
        ew.apps.kitty.state.is.pos.flip = 2;
      }
      // ---- check is the lid is blocked ----
      else if (i.act && i.act.includes("Lid") && 0.45 <= ew.apps.kitty.state.is.volt.base - ew.sys.batt()) {
        ew.apps.kitty.state.msg({ "type": "error", "title": "Lid Blocked", "persist": 1 });
      }
      // ---- move ----
      ew.apps.kitty.state.is.pos[i.servo] = +(ew.apps.kitty.state.is.pos[i.servo] + (ew.apps.kitty.state.is.pos.flip == 1 ? -0.01 : ew.apps.kitty.state.is.pos.dir == "dn" ? -0.01 : 0.01)).toFixed(2);
      ew.apps.kitty.call.servo(i.pin[i.servo], ew.apps.kitty.state.is.pos[i.servo], i.servo == "ball" ? 1 : 0);
      if (ew.apps.kitty.state.is.nrf)
        NRF.updateServices({ 0xffa0: { 0xffa2: { value: "pos=" + (ew.apps.kitty.state.is.pos[i.servo] * 100).toString(), notify: true } } });
    },
    go: function(i) {
      const state = ew.apps.kitty.state;
      state.is.sys.abort = 0;
      state.is.pos.flip = 0;
      state.is.pos.dir = 0;
      state.is.volt.base = ew.sys.batt();

      i.pin = { ball: D13, lock: D46, lid: D27 };

      // ---- dynamic values ----
      if (typeof i.next === 'function') i.next = i.next();
      if (typeof i.vibration === 'function') i.vibration = i.vibration();
      if (typeof i.one === 'function') i.one = i.one();
      if (typeof i.act === 'function') i.act = i.act();
      if (typeof i.hold === 'function') i.hold = i.hold();


      if (!i.speed) i.speed = 100;
      if (i.act == "ToF") state.is.tof.dist = 0;
      if (i.act) state.msg({ "type": "info", "title": i.act, "persist": 0 });

      // ---- vibration ----
      if (state.def.is.vibrator && state.is.vibrator.connected && i.vibration) {
        if (i.vibration == "pulse") {
          ew.apps.kitty.vibrator.write(i.vibration, i.repeat);
        }
        else {
          ew.apps.kitty.vibrator.write(i.vibration);
          if (3 == i.hold && i.vibration == "turnOn") setTimeout(() => { ew.apps.kitty.vibrator.write("turnOff"); }, 1500);
        }
      }
      
      // ---- lid ----
      if (ew.apps.kitty.state.def.is.lid && i.act && i.act.includes("Lid")) 
        ew.apps.scale.state.is.bypass=1;
        
      // ---- start the loop ----
      ew.apps.kitty.call.loop(i);
      
    },

    loop: function(i) {
      if (ew.tid.kittyI) {
        clearInterval(ew.tid.kittyI);
      }
      ew.tid.kittyI = setInterval(() => {

        // ---- speed ----
        if (i.act != "Locking") changeInterval(ew.tid.kittyI, i.speed * ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].speed);

        // ---- direction ----
        if (!ew.apps.kitty.state.is.pos.flip) {
          if (!ew.apps.kitty.state.is.pos.dir) ew.apps.kitty.state.is.pos.dir = (ew.apps.kitty.state.is.pos[i.servo] <= i.one) ? "up" : "dn";
          if (ew.apps.kitty.state.is.pos.dir == "up" && i.one <= ew.apps.kitty.state.is.pos[i.servo])
            ew.apps.kitty.state.is.pos.flip = 1;
          else if (ew.apps.kitty.state.is.pos.dir == "dn" && ew.apps.kitty.state.is.pos[i.servo] <= i.one)
            ew.apps.kitty.state.is.pos.flip = 1;
        }
        else ew.apps.kitty.state.is.pos.dir = 0;

        // ---- flip direction ----
        if (ew.apps.kitty.state.is.pos.flip == 1 && !i.two) ew.apps.kitty.state.is.pos.flip = 3;
        else if (ew.apps.kitty.state.is.pos.flip == 1 && ew.apps.kitty.state.is.pos[i.servo] <= i.two) ew.apps.kitty.state.is.pos.flip = i.three ? 2 : 3;
        else if (ew.apps.kitty.state.is.pos.flip == 2 && i.three <= ew.apps.kitty.state.is.pos[i.servo]) ew.apps.kitty.state.is.pos.flip = 3;

        // ---- ToF ----
        if (i.act == "ToF") {
          let t = ew.apps.ToF.read();
          if (ew.apps.kitty.state.is.tof.dist <= t) {
            ew.apps.kitty.state.is.tof.dist = t;
            ew.apps.kitty.state.is.tof.pos = ew.apps.kitty.state.is.pos[i.servo];
          }
        }

        // ---- recovery ----
        if (ew.apps.kitty.state.def.is.voltMon && (ew.pin.CHRG.read() || ew.apps.kitty.state.is.sys.abort)) {
          ew.apps.kitty.call.recovery(i);
        }

        // ---- pause ----
        else if (ew.apps.kitty.state.is.sys.pause)
          return;

        // ---- exit ----
        else if (ew.apps.kitty.state.is.pos.flip == 3) {
          ew.apps.kitty.call.exit(i);
        }

        // ---- movement ----
        else
          ew.apps.kitty.call.move(i);
      }, i.speed);
    },

    autoClean: function(i) {
      if (ew.tid.kittyI) {
        clearInterval(ew.tid.kittyI);
        ew.apps.kitty.state.is.sys.cnt = 0;
        ew.tid.kittyI = 0;
      }
      if (i || !ew.apps.kitty.state.def.auto.clean) return;

      // ---- get auto clean delay ----
      let v = 60 * ew.apps.kitty.state.def.auto.delay;

      // ---- count down ----
      ew.apps.kitty.state.msg({ "type": "info", "title": "Hello Kitty", "persist": 0 });
      ew.tid.kittyI = setInterval(() => {
        v--;
        ew.apps.kitty.state.msg({ "type": "info", "title": (60 * ew.apps.kitty.state.def.auto.delay - 3 <= v) ? "Hello Kitty" : "Empty in " + v, "persist": 0 });
        ew.apps.kitty.state.is.sys.cnt = v;
        if (v <= 0) {
          clearInterval(ew.tid.kittyI);
          ew.tid.kittyI = 0;
          ew.apps.kitty.state.is.sys.cnt = 0;
          ew.apps.kitty.call.wake("clean");
        }
        else if (v <= 5)
          ew.sys.buzz.nav(ew.sys.buzz.type.on);

      }, 1000);
    },

    wake: function(e) {
      if (ew.def.scrn && !g.isOn) ew.face.go("main", 0);
      ew.apps.kitty.call.autoClean("clear");
      if (ew.tid.kittyT) {
        clearTimeout(ew.tid.kittyT);
        ew.tid.kittyT = 0;
      }

      // ---- check for low battery ----
      if (e != "recovery" && ew.sys.batt("info").percent <= 0) {
        ew.apps.kitty.state.msg({ "type": "error", "title": "Low Battery", "alert": 1, "persist": 1 });
        if (ew.apps.kitty.state.def.is.voltMon)
          return;
      }

      // ---- connect vibrator ----
      if (ew.apps.kitty.state.def.is.vibrator && !ew.apps.kitty.state.is.vibrator.connected) 
        ew.apps.kitty.vibrator.connect();

      // ---- check if allready on ----
      if (ew.pin.CHRG.read()) {

        //ew.apps.kitty.state.msg({ "type": "info", "title": "Waking up", "persist": 0 });
        digitalPulse(D38, 0, 100);
      }
      else if (!ew.pin.CHRG.read()) {
        ew.apps.kitty.state.is.sys.pwr = 1;
        if (e != "recovery" && !ew.apps.kitty.state.isOnBase()) return;
        if (e) ew.apps.kitty.call.action(e);
        return;
      }

      // ---- loop till power on ----
      if (ew.tid.kittyI) {
        clearInterval(ew.tid.kittyI);
        ew.tid.kittyI = 0;
      }
      ew.tid.kittyI = setInterval(() => {
        // ---- power is on ----
        if (!ew.pin.CHRG.read() || !ew.apps.kitty.state.def.is.voltMon) {

          ew.apps.kitty.state.is.sys.pwr = 1;
          if (ew.tid.kittyT) {
            clearTimeout(ew.tid.kittyT);
            ew.tid.kittyT = 0;
          }
          clearInterval(ew.tid.kittyI);
          ew.tid.kittyI = 0;

          if (ew.face[0].page == "more1")
            ew.UI.btn.c2l("main", "_2x3", 3, "POWER", ew.pin.CHRG.read() ? "OFF" : "ON", 15, ew.pin.CHRG.read() ? 1 : 4);
          if (e != "recovery" && !ew.apps.kitty.state.isOnBase()) return;
          if (e) ew.apps.kitty.call.action(e);
        }
        // ---- no power, retry ----
        else if (ew.pin.CHRG.read()) {
          ew.apps.kitty.state.msg({ "type": "error", "title": "Wake up failed", "body": "retrying", "persist": 0 });
          digitalPulse(D38, 0, 100);
        }
      }, 2500);
    },

    sleep: function(full) {
      if (ew.tid.kittyT) {
        clearTimeout(ew.tid.kittyT);
        ew.tid.kittyT = 0;
      }
      if (ew.tid.kittyI) {
        clearInterval(ew.tid.kittyI);
        ew.tid.kittyI = 0;
      }

      if (!ew.pin.CHRG.read()) digitalPulse(D38, 0, [100, 200, 100]);

      // ---- loop till power off ----
      ew.tid.kittyT = setTimeout(() => {
        ew.tid.kittyT = 0;

        // ---- power is off ----
        if (ew.pin.CHRG.read()) {



          // ---- reset servo pins, else PWM module draws 200μA ----
          pinMode(D13, "opendrain_pullup", true); //ball servo
          pinMode(D46, "opendrain_pullup", true); //lock servo
          poke32(0x50000700 + 13 * 4, 2);
          poke32(0x50000700 + 46 * 4, 2);
          // ---- charge pin draws 70μΑ ----
          poke32(0x50000700 + 8 * 4, 2);

          // ---- disconnect vibrator ----
          //if (ew.apps.kitty.state.def.is.vibrator && ew.apps.kitty.state.is.vibrator.connected) ew.apps.kitty.vibrator.disconnect();

          // ---- schedule UVC mini cycle ----
          /*if (ew.apps.kitty.state.is.auto.uvc) {
            ew.apps.kitty.state.is.auto.uvc = 0;
            ew.tid.kittyT = setTimeout(() => {
              ew.tid.kittyT = 0;
              ew.apps.kitty.call.wake("unlock", "uvc");
            }, 180000);
          }
          */

          if (ew.face[0].page == "more1")
            ew.UI.btn.c2l("main", "_2x3", 3, "POWER", ew.pin.CHRG.read() ? "OFF" : "ON", 15, ew.pin.CHRG.read() ? 1 : 4);

          // ---- do sys sleep if selected ----
          if (full) ew.do.sysSleep();
          // ---- if manual clean, reset scale ----
          else if (ew.apps.kitty.state.is.sys.manual && ew.apps.kitty.state.def.is.scale && ew.apps.kitty.state.is.sys.busy) {
            ew.apps.scale.state.log.idle = [];
            ew.apps.scale.start();
          }
          else
            ew.tid.kittyT = setTimeout(() => {
              ew.tid.kittyT = 0;
              ew.apps.kitty.state.msg({ "type": "info", "title": "Bye bye", "persist": 0 });
              ew.face.off(8000);
            }, 2000);
            
          ew.apps.kitty.state.is.sys.busy = 0;
          ew.apps.kitty.state.is.sys.pwr = 0;
          ew.apps.kitty.state.is.sys.pause = 0;
          ew.apps.kitty.state.is.sys.manual = 0;
          ew.apps.scale.state.is.safe = 0;

        }
        // ---- power still on, retry ----
        else {
          ew.apps.kitty.state.msg({ "type": "error", "title": "Sleep failed", "persist": 1 });
          ew.tid.kittyT = setTimeout(() => {
            ew.tid.kittyT = 0;
            ew.apps.kitty.call.sleep(full ? 1 : 0);
          }, 1500);
        }
      }, 2500);
    },

    action: function(i) {
      ew.apps.kitty.state.is.sys.busy = 1;
      ew.apps.kitty.state.is.action = i;

      // ---- log cleaning cycle ----
      if (i == "clean") {
        if (ew.logger.kitty) ew.logger.kitty.logUsage("clean");
        ew.apps.kitty.state.is.sys.run++;
        ew.apps.kitty.state.def.is.total++;
      }

      // ---- check if Lid ----
      ew.apps.kitty.call.go(ew.apps.kitty.pattern(ew.apps.kitty.state.def.is.lid ? "lid_open" : "unlock"));
    }
  }
};

// === events ===

// ---- BT ----

ew.sys.on("BLE_RX", (i) => {

  if (!ew.apps.kitty.state.is.nrf) {
    ew.apps.kitty.state.is.nrf = 1;
    if (ew.tid.nrf) clearInterval(ew.tid.nrf);
    ew.tid.nrf = setInterval(function() {
      kitty.state.BLE_send();
    }, 1000);
  }

  if (i.startsWith(1)) {
    if (i == 11) ew.emit('button', 'short');
    else if (i == 12) ew.emit('button', 'long');
    else if (i == 13) ew.emit('button', 'triple');
    //else if (i == 14) ew.apps.kitty.state.BLE_send();
    else if (i.startsWith(16)) setTime(Number(i.split("=")[1] / 1000));
    else if (i.startsWith(17)) {

    }
    else if (i == 18) ew.apps.kitty.state.is.sys.abort = 1;
    else if (i == 19) ew.apps.kitty.state.update();
  }
  else if (i.startsWith(3)) ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].speed = (19 - (i - 30)) / 10;
  else if (i.startsWith(4)) ew.apps.kitty.state.def.is.sandType = i - 40;
  else if (i.startsWith(5)) ew.apps.kitty.state.def.auto.uvc = i - 50;
  else if (i.startsWith(6)) ew.apps.kitty.state.def.auto.delay = i - 60;
  else if (i.startsWith(7)) ew.apps.kitty.state.def.auto.clean = i - 70;
  else if (i.startsWith(8)) ew.apps.kitty.state.is.sys.pause = i - 80;
});

NRF.on('disconnect', function() {
  if (ew.tid.nrf) {
    clearInterval(ew.tid.nrf);
    ew.tid.nrf = 0;
  }
  ew.apps.kitty.state.is.nrf = 0;
});

// ---- button ----

ew.sys.on("button", (x) => {
  if (x === "short") return;
  if (ew.apps.kitty.state.is.sys.busy) {
    if (x == "long") {
      ew.apps.kitty.state.msg({ "type": "info", "title": ew.apps.kitty.state.is.sys.pause ? "Resuming" : "Paused", "persist": ew.apps.kitty.state.is.sys.pause ? 0 : 1 });
      ew.apps.scale.state.is.bypass = ew.apps.kitty.state.is.sys.pause? 0:1;
      ew.apps.kitty.state.is.sys.pause = 1 - ew.apps.kitty.state.is.sys.pause;
      return;
    }
    ew.sys.buzz.nav(300);
    ew.apps.kitty.state.msg({ "type": "info", "title": "I am busy", "persist": 0 });
    return;
  }
  else if (x == "double") {
    //ew.apps.kitty.state.msg({ "type": "info", "title": !ew.pin.CHRG.read() ? "Going to sleep" : "Waking up", "persist": 0 });
    ew.apps.kitty.state.is.sys.manual = 1;
    !ew.pin.CHRG.read() ? ew.apps.kitty.call.sleep() : ew.apps.kitty.call.wake();
  }
  else {
    ew.sys.buzz.nav(ew.sys.buzz.type.ok);
    if (ew.face.appCurr != "main" || ew.face.pageCurr == -1)
      ew.face.go("main", 0);
    ew.apps.kitty.state.is.sys.manual = 1;
    ew.apps.scale.clean(0); //cancel auto clean
    ew.apps.kitty.call.wake((x == "triple") ? "empty" : "clean");
    ew.apps.kitty.state.msg({ "type": "info", "title": (x == "triple") ? "EMPTY THE SAND" : "CLEAN CYCLE", "persist": 0 });

  }

});

// === defaults ===

if (!require('Storage').readJSON('ew.json', 1).kitty) {
  ew.apps.kitty.state.def = {
    is: {
      sandType: 1,
      fail: 3,
      clb: 0,
      total: 0,
      voltMon: 1,
      scale: 1,
      tof: 1,
      lid: 0,
      vibrator: 0
    },
    auto: {
      uvc: 0,
      clean: 1,
      delay: 3,
      pause: 1,
      light: 1,
      every: { on: 0, hours: [2, 8, 15, 20] }
    },
    sand: {
      1: { name: "betonite", speed: 1, max: 3600, min: 1000, prep: 1 },
      2: { name: "silicone", speed: 1, max: 1500, min: 500, prep: 1 },
      3: { name: "pellet", speed: 1, max: 2800, min: 800, prep: 1 },
      4: { name: "tofu", speed: 1, max: 2000, min: 600, prep: 1 }
    },
    tof: {
      lost: 6553.5,
      empty: 43.5,
      full: 35
    },
    lid: {
      open: 0.55,
      shut: 0.03
    }
  };
  ew.do.update.settings();
}
else ew.apps.kitty.state.def = require('Storage').readJSON('ew.json', 1).kitty;

//  ---- connect vibrator ----
if (ew.apps.kitty.state.def.is.vibrator && !ew.apps.kitty.state.is.vibrator.connected) {
  setTimeout(()=>{ew.apps.kitty.vibrator.connect();},12000);
}

// ---- wake for ToF reading ----
if (ew.apps.kitty.state.def.is.tof && ew.apps.kitty.state.def.is.scale)
  setTimeout(()=>{ew.apps.kitty.call.wake();},1000);
// === move patterns ===

ew.apps.kitty.pattern = (key) => {
  const clb = ew.apps.kitty.state.def.is.clb;
  const state = ew.apps.kitty.state;

  switch (key) {
    // === Litter Patterns ===

    // ---- Betonite Sand ----
    case "betonite":
      return { servo: "ball", one: 1.5 + clb, act: "Clean", next: "betonite_1" };
    case "betonite_1":
      return { servo: "ball", one: 2 + clb, act: "ToF", vibration: "pulse", repeat: 10, hold: 2, next: "betonite_2" };
    case "betonite_2":
      return { servo: "ball", one: 0.70 + clb, two: 0.01, act: "Level", hold: 2, next: "betonite_3" };
    case "betonite_3":
      return { servo: "ball", one: 0.70 + clb, act: "Return", next: "lock" };

      // ---- Pellet Non-Stick ----
    case "pellet":
      return { servo: "ball", one: 1.2 + clb, act: "Empty", hold: 10, vibration: "pulse", repeat: 6, next: "pellet_1" };
    case "pellet_1":
      return { servo: "ball", one: 1.3 + clb, hold: 10, vibration: "pulse", repeat: 6, next: "pellet_2" };
    case "pellet_2":
      return { servo: "ball", one: 1.4 + clb, hold: 10, vibration: "pulse", repeat: 6, next: "pellet_3" };
    case "pellet_3":
      return { servo: "ball", one: 1.5 + clb, hold: 10, vibration: "pulse", repeat: 6, next: "pellet_4" };
    case "pellet_4":
      return { servo: "ball", one: 1.6 + clb, hold: 10, vibration: "pulse", repeat: 6, next: "pellet_5" };
    case "pellet_5":
      return { servo: "ball", one: 1.9 + clb, hold: 6, vibration: "pulse", repeat: 4, next: "pellet_6" };
    case "pellet_6":
      return { servo: "ball", one: 2.0 + clb, act: "ToF", hold: 6, vibration: "pulse", repeat: 8, next: "pellet_7", speed: 200 };
    case "pellet_7":
      return { servo: "ball", one: 0.5 + clb, act: "Empty", hold: 1, next: "pellet_8" };
    case "pellet_8":
      return { servo: "ball", one: 0.4 + clb, hold: 3, vibration: "pulse", repeat: 4, next: "pellet_9" };
    case "pellet_9":
      return { servo: "ball", one: 0.3 + clb, hold: 3, vibration: "pulse", repeat: 4, next: "pellet_10" };
    case "pellet_10":
      return { servo: "ball", one: 0.2 + clb, hold: 3, vibration: "pulse", repeat: 4, next: "pellet_11" };
    case "pellet_11":
      return { servo: "ball", one: 0.1 + clb, next: "pellet_12" };
    case "pellet_12":
      return { servo: "ball", one: 0.01, hold: 30, vibration: "turnOn", next: "pellet_13" };
    case "pellet_13":
      return { servo: "ball", one: 0.02, two: 0.01, hold: 30, vibration: "turnOn", next: "pellet_14" };
    case "pellet_14":
      return { servo: "ball", one: 0.65 + clb, vibration: "turnOff", next: "pellet_15" };
    case "pellet_15":
      return { servo: "ball", one: 0.70 + clb, act: "Return", next: "lock" };

      // ---- Standard Non-Stick Sand ----
    case "nonstick":
      return { servo: "ball", one: 1.4 + clb, two: 1.35, three: 1.4, act: "Step 1", next: "nonstick_1", speed: 80 };
    case "nonstick_1":
      return { servo: "ball", one: 1.5 + clb, two: 1.45, three: 1.5, act: "Step 2", next: "nonstick_2", speed: 80 };
    case "nonstick_2":
      return { servo: "ball", one: 1.6 + clb, two: 1.55, three: 1.6, act: "step 3", next: "nonstick_3", speed: 80 };
    case "nonstick_3":
      return { servo: "ball", one: 1.75 + clb, two: 1.70, three: 1.95 + clb, act: "ToF", next: "nonstick_4", speed: 80 };
    case "nonstick_4":
      return { servo: "ball", one: 2 + clb, two: 1.95, act: "Empty", next: "nonstick_5", speed: 80 };
    case "nonstick_5":
      return { servo: "ball", one: 2 + clb, two: 0.01, act: "Level", next: "nonstick_6", speed: 80 };
    case "nonstick_6":
      return { servo: "ball", one: 0.02, two: 0.01, act: "Wait", next: "nonstick_7" };
    case "nonstick_7":
      return { servo: "ball", one: 1 + clb, two: 0.01, three: 0.70 + clb, act: "Return", next: "lock", speed: 80 };

      // ---- Silicone Crystals ----
    case "silicone":
      return { servo: "ball", one: 1.4 + clb, act: "Clean", hold: 3, vibration: "turnOn", next: "silicone_1" };
    case "silicone_1":
      return { servo: "ball", one: 1.5 + clb, hold: 3, vibration: "turnOn", next: "silicone_2" };
    case "silicone_2":
      return { servo: "ball", one: 1.95 + clb, act: "ToF", hold: 3, vibration: "turnOn", next: "silicone_3" };
    case "silicone_3":
      return { servo: "ball", one: 0.5 + clb, hold: 3, next: "silicone_4" };
    case "silicone_4":
      return { servo: "ball", one: 0.4 + clb, hold: 3, vibration: "turnOn", next: "silicone_5" };
    case "silicone_5":
      return { servo: "ball", one: 0.3 + clb, hold: 3, vibration: "turnOn", next: "silicone_6" };
    case "silicone_6":
      return { servo: "ball", one: 0.2 + clb, hold: 3, vibration: "turnOn", next: "silicone_7" };
    case "silicone_7":
      return { servo: "ball", one: 0.1 + clb, hold: 3, vibration: "turnOn", next: "silicone_8" };
    case "silicone_8":
      return { servo: "ball", one: 0.01, hold: 4, vibration: "turnOn", next: "silicone_9" };
    case "silicone_9":
      return { servo: "ball", one: 0.70 + clb, act: "Return", vibration: "turnOff", next: "lock" };

      // ---- Tofu (needs vibrator) ----
    case "tofu":
      return { servo: "ball", one: 1.45 + clb, act: "Clean", vibration: "turnOn", hold: 3, next: "tofu_1" };
    case "tofu_1":
      return { servo: "ball", one: 1.99 + clb, act: "ToF", vibration: "turnOn", hold: 5, next: "tofu_2" };
    case "tofu_2":
      return { servo: "ball", one: 0.5 + clb, act: "Level", vibration: "turnOff", next: "tofu_3" };
    case "tofu_3":
      return { servo: "ball", one: 0.01, vibration: "turnOn", hold: 15, next: "tofu_4" };
    case "tofu_4":
      return { servo: "ball", one: 0.70 + clb, act: "Return", vibration: "turnOff", next: "lock" };

      // === System Patterns ===
      // ---- Lock ----
    case "lock":
      return {
        servo: "lock",
        one: 1,
        act: "Lock",
        vibration: "pulse",
        repeat: 3,
        next: "secure",
        speed: 30,
        hold: state.is.vibrator.connected ? 4 : 1
      };
    case "secure":
      return { servo: "ball", one: 0.45 + clb, two: 0.15 + clb, three: 0.45 + clb, act: "Secure", next: () => state.def.is.lid ? "lid_close" : "sleep" };

      // ---- Unlock ----
    case "unlock":
      return {
        servo: "lock",
        one: 0.02,
        two: 0.01,
        repeat: 3,
        hold: 2,
        act: "Unlock",
        next: "release",
        speed: 30,
      };
    case "release":
      return {
        servo: "ball",
        one: 0.42 + clb,
        two: 0.15 + clb,
        three: 0.52 + clb,
        vibration: "pulse",
        act: "Release",
        speed: 150,
        next: () => state.is.action == "clean" ?
          state.def.sand[state.def.is.sandType].prep ?
          "prepare" : state.def.sand[state.def.is.sandType].name :
          state.is.action,
      };

      // ---- Lid Control ----
    case "lid_open":
      return { servo: "lid", one: state.def.lid.open, act: "Open Lid", next: "unlock", speed: 100 };
    case "lid_close":
      return { servo: "lid", one: state.def.lid.shut, act: "Close Lid", next: "sleep", speed: 100 };
    case "lid_toggle":
      return {
        servo: "lid",
        speed: 100,
        one: () => 0.3 <= state.is.pos.lid ? state.def.lid.shut : state.def.lid.open,
        act: () => 0.3 <= state.is.pos.lid ? "Closing Lid" : "Opening Lid"
      };
    case "open_lid":
      return { servo: "lid", one: state.def.lid.open, act: "Opening Lid", speed: 80 };
    case "close_lid":
      return { servo: "lid", one: state.def.lid.shut, act: "Closing Lid", speed: 80 };


      // ---- Recovery ----
    case "recovery":
      return { servo: "ball", one: 0.3, two: 0.2, act: "Recovery", next: "recovery1" };
    case "recovery1":
      return {
        servo: "ball",
        one: 0.01,
        vibration: "turnOn",
        next: "recovery2",
        hold: state.is.vibrator.connected ? 4 : 1
      };
    case "recovery2":
      return { servo: "ball", one: 0.65 + clb, vibration: "turnOff", next: "lock" };


      // === Extra Patterns ===

      // ---- prepare clean motion ----
    case "prepare":
      return {
        servo: "ball",
        one: 1 + clb,
        act: "Prepare",
        hold: 1,
        next: "prepare_1",
        speed: 80,
      };
    case "prepare_1":
      return {
        servo: "ball",
        one: 0.01,
        hold: 1,
        next: "prepare_2",
        speed: 80,
        next: () => state.def.sand[state.def.is.sandType].name
      };
    case "prepare_2":
      return {
        servo: "ball",
        one: 1 + clb,
        speed: 80,
        next: () => state.def.sand[state.def.is.sandType].name
      };

      // ---- UVC Light ----
    case "uvc":
      return { servo: "ball", one: 0.85 + clb, two: 0.65, act: "UVC-wake", next: "lock", speed: 70 };

      // ---- Empty - vibrator detect ----
    case "empty":
      return {
        servo: "ball",
        one: 1.6 + clb,
        act: "Empty Sand",
        next: state.is.vibrator.connected ? "empty_v1" : "empty1"
      };

      // ---- Empty (Vibrator Disabled) ----
    case "empty1":
      return { servo: "ball", one: 1.90 + clb, hold: 3, next: "empty2" };
    case "empty2":
      return { servo: "ball", one: 1.50 + clb, hold: 1, next: "empty3" };
    case "empty3":
      return { servo: "ball", one: 1.95 + clb, hold: 3, next: "empty4", speed: 50 };
    case "empty4":
      return { servo: "ball", one: 1 + clb, next: "empty5" };
    case "empty5":
      return { servo: "ball", one: 2.0 + clb, hold: 4, next: "empty6", speed: 50 };
    case "empty6":
      return { servo: "ball", one: 2.0 + clb, two: 1.0, three: 2.0 + clb, next: "empty7", speed: 50 };
    case "empty7":
      return { servo: "ball", one: 0.65 + clb, act: "Return", next: "lock" };

      // ---- Empty (Vibrator Enabled) ----
    case "empty_v1":
      return { servo: "ball", one: 1.70 + clb, hold: 1, next: "empty_v2" };
    case "empty_v2":
      return { servo: "ball", one: 1.80 + clb, hold: 5, vibration: "pulse", repeat: 4, next: "empty_v3" };
    case "empty_v3":
      return { servo: "ball", one: 1.90 + clb, hold: 5, vibration: "pulse", repeat: 4, next: "empty_v4" };
    case "empty_v4":
      return { servo: "ball", one: 1.80 + clb, hold: 5, vibration: "pulse", repeat: 4, next: "empty_v5" };
    case "empty_v5":
      return { servo: "ball", one: 1.70 + clb, hold: 5, vibration: "pulse", repeat: 4, next: "empty_v6" };
    case "empty_v6":
      return { servo: "ball", one: 1.80 + clb, hold: 5, vibration: "pulse", repeat: 4, next: "empty_v7" };
    case "empty_v7":
      return { servo: "ball", one: 2.0 + clb, hold: 5, vibration: "pulse", repeat: 4, next: "empty_v8", speed: 50 };
    case "empty_v8":
      return { servo: "ball", one: 2 + clb, two: 0.70 + clb, act: "Return", next: "lock" };

      // === Default ===
    default:
      throw new Error(`Unknown pattern key: ${key}`);
  }
};
