// MIT License (c) 2024 enaon https://github.com/enaon
// see full license text at https://choosealicense.com/licenses/mit/

E.setConsole(Bluetooth, { force: true });
pinMode(D13, "opendrain_pullup"); //ball servo
pinMode(D46, "output"); //lock servo
//pinMode(D27, "output"); //sck hx711-lid servo
pinMode(D38, "output"); //powerbank on-off


//main
kitty = {
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
        last: {

        }
      },
      tof: { dist: 0, per: 0, state: "na" }
    },
    msg: function(i, p, a) {
      if (a) notify.alert("error", { body: "", title: i.toUpperCase() }, 0, p);
      else notify.alert("info", { body: "", title: i.toUpperCase() }, 0, p);
    },
    update: function() { require('Storage').write('kitty.json', ew.apps.kitty.state.def); },
    print: function() {
      return;
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
    sendBT: function(char, msg) {
      //NRF.updateServices({ 0xffa0: { char: {value:
    },
    nrfUpdate: function(v) {
      if (!ew.apps.kitty.state.is.nrf) return;
    },
    isOnBase: () => {
      if (kitty.tof(1) == "sensor lost" && ew.apps.kitty.state.def.is.tof) {
        ew.apps.kitty.state.msg("Base not found");
        ew.tid.kittyT = setTimeout(() => {
          ew.tid.kittyT = 0;
          kitty.action.sleep();
        }, 2000);
        return false;
      }
      else return true;
    }
  },
  scale: {
    log: [],
    tid: 0,
    average: array => array.reduce((a, b) => a + b) / array.length,
    start: () => {
      scale.busy = 1;
      //if (!scale.state.value.isReady()) scale.init();
      if (kitty.scale.tid) clearInterval(kitty.scale.tid);
      ew.apps.kitty.state.is.scale.last.base = Math.round(scale.state.value.readGrams());
      kitty.scale.tid = setInterval(() => {
        let w = Math.round(scale.state.value.readGrams());
        if (ew.apps.kitty.state.is.scale.last.base==scale.state.def.lost)  ew.apps.kitty.state.is.scale.last.base = w;
        if (w != scale.state.def.lost) kitty.scale.log.unshift(w);
        if (11 <= kitty.scale.log.length) kitty.scale.log.pop();
        console.log(kitty.scale.average(kitty.scale.log));
        console.log(w, kitty.scale.log);
        if (500 + ew.apps.kitty.state.is.scale.last.base <= w || w <= ew.apps.kitty.state.is.scale.last.base - 500) {
          console.log("stop");
          ew.apps.kitty.state.is.sys.pause = 1;
        }
        else {
          console.log("resume");
          ew.apps.kitty.state.is.sys.pause = 0;
        }
        //console.log(scale.status());
      }, 500);

    },
    stop: () => {
      if (kitty.scale.tid) clearInterval(kitty.scale.tid);
      kitty.scale.tid = 0;
      scale.state.value.setStandby(1);
    }
  },
  vibrator: {
    device: 0,
    connected: 0,
    on: 0,
    connect: (x) => {
      NRF.requestDevice({ timeout: 5000, filters: [{ namePrefix: 'eL-' + ew.def.name + '-V' }] }).then(function(device) {
        return require("bleuart").connect(device);
      }).then(function(device) {
        kitty.vibrator.device = device;
        kitty.vibrator.connected = 1;
        //device.on('data', function(d) { print("Got:"+JSON.stringify(d)); });
      });
    },
    disconnect: (x) => {
      //if (global["\xFF"].BLE_GATTS) kitty.vibrator.device.disconnect();
      try { kitty.vibrator.device.disconnect(); }
      catch (error) { console.log("VIB: " + error) }
      kitty.vibrator.connected = 0;
    },
    write: (action, repeat) => {
      kitty.vibrator.on = action == "turnOn" ? 1 : 0;
      kitty.vibrator.device.write(`powerbank.${action}(1,${repeat});\n`);
    }
  },
  tof: function(silent) {
    let t = tof.read();
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
    if (!silent && msg) ew.apps.kitty.state.msg(msg, 0);
    return ew.apps.kitty.state.is.tof.state;
  },
  call: {
    move: function(pin, pos, range) {
      i = range ? 0.5 : 1;
      if (pos <= 0) pos = 0;
      if (1 / i <= pos) pos = 1 / i;
      //console.log("pos:"+pos);
      analogWrite(pin, (i + pos) / 50.0, { freq: 20, soft: false });
    },
    go: function(i) {
      if (ew.tid.kittyI) {
        clearInterval(ew.tid.kittyI);
        ew.tid.kittyI = 0;
        //return;
      }
      ew.apps.kitty.state.is.sys.abort = 0;
      ew.apps.kitty.state.is.pos.flip = 0;
      ew.apps.kitty.state.is.pos.dir = 0;
      if (!i.speed) i.speed = 100;
      ew.apps.kitty.state.is.volt.base = ew.sys.batt();
      if (i.act == "ToF") ew.apps.kitty.state.is.tof.dist = 0;
      i.pin = { ball: D13, lock: D46, lid: D27 };
      //messasge
      if (i.act) {
        ew.apps.kitty.state.msg(i.act, 0);
        if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString(i.act), notify: true } } });
      }
      //vibration
      if (ew.apps.kitty.state.def.is.vibrator && kitty.vibrator.connected && i.vibration) {
        if (i.vibration == "pulse") {
          kitty.vibrator.write(i.vibration, i.repeat);
        }
        else {
          kitty.vibrator.write(i.vibration);
          if (3 == i.hold && i.vibration == "turnOn") setTimeout(() => { kitty.vibrator.write("turnOff"); }, 1500);
        }
      }
      //Lid
      if (ew.apps.kitty.state.def.is.lid && i.act && i.act.includes("Lid")) 
        pinMode(i.pin.lid, "output"); //sck hx711-lid servo
      //loop start
      ew.tid.kittyI = setInterval(() => {
        //print("ll",i,i.servo,ew.apps.kitty.state.is.pos[i.servo]);
        //speed
        if (i.act != "Locking") changeInterval(ew.tid.kittyI, i.speed * ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].speed);
        //direction
        if (!ew.apps.kitty.state.is.pos.flip) {
          if (!ew.apps.kitty.state.is.pos.dir) ew.apps.kitty.state.is.pos.dir = (ew.apps.kitty.state.is.pos[i.servo] <= i.one) ? "up" : "dn";
          if (ew.apps.kitty.state.is.pos.dir == "up"&& i.one <= ew.apps.kitty.state.is.pos[i.servo])
              ew.apps.kitty.state.is.pos.flip = 1;
          else if (ew.apps.kitty.state.is.pos.dir == "dn" && ew.apps.kitty.state.is.pos[i.servo] <= i.one)
              ew.apps.kitty.state.is.pos.flip = 1;
        } else ew.apps.kitty.state.is.pos.dir=0;
        if (ew.apps.kitty.state.is.pos.flip == 1 && !i.two) ew.apps.kitty.state.is.pos.flip = 3;
        else if (ew.apps.kitty.state.is.pos.flip == 1 && ew.apps.kitty.state.is.pos[i.servo] <= i.two ) ew.apps.kitty.state.is.pos.flip = i.three ? 2 : 3;
        else if (ew.apps.kitty.state.is.pos.flip == 2 && i.three <= ew.apps.kitty.state.is.pos[i.servo]) ew.apps.kitty.state.is.pos.flip = 3;
        //loop exit
        if (ew.apps.kitty.state.is.pos.flip == 3) {
          clearInterval(ew.tid.kittyI);
          ew.tid.kittyI = 0;
          if (i.act == "Return" && ew.apps.kitty.state.def.auto.uvc) ew.apps.kitty.state.is.auto.uvc = 1;
          if (i.act == "ToF") {
            let t = 100 - (ew.apps.kitty.state.is.tof.dist - ew.apps.kitty.state.def.tof.full) * (100 / (ew.apps.kitty.state.def.tof.empty - ew.apps.kitty.state.def.tof.full)) | 0;
            ew.apps.kitty.state.is.tof.per = t;
            ew.apps.kitty.state.msg("Waste bin: " + t + " %", 0);
            //console.log("tof persentage saved:"+t+",pos:"+ew.apps.kitty.state.is.pos[i.servo]+",act:"+i.act);
          }
          if (ew.apps.kitty.state.def.is.lid && i.act && i.act.includes("Lid")) {
            pinMode(i.pin.lid, "input"); //release servo
            pinMode(i.pin.lid, "output");
            if (!ew.apps.kitty.state.def.is.scale) digitalWrite(i.pin.lid, 1, 100); //set hx711 to sleep mode
          }
          if (i.next) {
            //NRF.updateServices({0xffa0:{0xffa1:{value:E.toString(i.next),notify:true}} });
            setTimeout(() => { kitty.action[i.next](i.then ? i.then : ''); }, i.hold?i.hold * 1000:200);

          }
          return;
        }
        //ToF
        if (i.act == "ToF") {
          let t = tof.read();
          //console.log("tof:"+t);
          if (ew.apps.kitty.state.is.tof.dist <= t) {
            //console.log("tof prev-saved:"+ew.apps.kitty.state.is.tof.dist+"-"+t+",pos:"+ew.apps.kitty.state.is.pos[i.servo]+",act:"+i.act);
            ew.apps.kitty.state.is.tof.dist = t;
            ew.apps.kitty.state.is.tof.pos = ew.apps.kitty.state.is.pos[i.servo];
          }
        }
        //recovery
        if (ew.apps.kitty.state.def.is.voltMon && (ew.pin.CHRG.read() || ew.apps.kitty.state.is.sys.abort)) {
          //if ( ew.apps.kitty.state.def.is.voltMon && (ew.sys.batt() <= ew.apps.kitty.state.def.is.fail || ew.apps.kitty.state.is.sys.abort)) {
          ew.apps.kitty.state.is.volt.failed = ew.sys.batt();
          if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Power down"), notify: true } } });
          clearInterval(ew.tid.kittyI);
          ew.tid.kittyI = 0;
          if (!ew.apps.kitty.state.is.sys.abort) {
            //if (1.5 <= ew.apps.kitty.state.is.pos[i.servo] && i.act != "Return") ew.apps.kitty.state.is.pos[i.servo] = 1.45 + ew.apps.kitty.state.def.is.clb;
            //else 
            ew.apps.kitty.state.is.pos[i.servo] = ew.apps.kitty.state.is.pos[i.servo] + (ew.apps.kitty.state.is.pos.flip == 1 ? 0.25 : -0.25);
            kitty.call.move(i.pin[i.servo], ew.apps.kitty.state.is.pos[i.servo], 1);
          }
          if (ew.tid.kittyT) {
            clearTimeout(ew.tid.kittyT);
            ew.tid.kittyT = 0;
          }
          ew.tid.kittyT = setTimeout(() => {
            ew.tid.kittyT = 0;
            kitty.call.wake("unlock", "recovery");
          }, 1500);
        }
        //movement
        else if (!ew.apps.kitty.state.is.sys.pause && ew.apps.kitty.state.is.pos.flip != 3) {
          //do not put too much force on the lock
          if ((i.act == "Secure" || i.act == "Release") && 0.05 <= ew.apps.kitty.state.is.volt.base - ew.sys.batt() && ew.apps.kitty.state.is.pos.flip == 1) {
            ew.apps.kitty.state.is.pos.flip=2;
            if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Lock release"), notify: true } } });
            return;
          }
          //do not put too much force on the lid
          else if (  i.act && i.act.includes("Lid") && 0.10 <= ew.apps.kitty.state.is.volt.base - ew.sys.batt()) {
            ew.apps.kitty.state.is.pos.flip = 3;
            ew.apps.kitty.state.msg("Lid Blocked", 0, 1);
            //if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Lid paused"), notify: true } } });
            return;
          }
          //move
          ew.apps.kitty.state.is.pos[i.servo] = +(ew.apps.kitty.state.is.pos[i.servo] + (ew.apps.kitty.state.is.pos.flip == 1 ? -0.01 : ew.apps.kitty.state.is.pos.dir == "dn" ? -0.01 : 0.01)).toFixed(2);
          kitty.call.move(i.pin[i.servo], ew.apps.kitty.state.is.pos[i.servo], i.servo == "ball" ? 1 : 0);
          if (ew.apps.kitty.state.is.nrf && 0 <= ew.apps.kitty.state.is.pos[i.servo]) {
            //console.log(ew.apps.kitty.state.is.pos[i.servo]);
            NRF.updateServices({ 0xffa0: { 0xffa2: { value: "pos=" + (ew.apps.kitty.state.is.pos[i.servo] * 100).toString(), notify: true } } });

          }
        }
      }, i.speed);
    },
    wake: function(i, e) {
      kitty.action.count("clear");
      if (ew.tid.kittyT) {
        clearTimeout(ew.tid.kittyT);
        ew.tid.kittyT = 0;
      }
      if (e != "recovery") {
        if (ew.sys.batt() <= 3.30) {
          if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("low battery"), notify: true } } });
          ew.apps.kitty.state.msg("Low Battery", 0, 1);
          if (ew.apps.kitty.state.def.is.voltMon) return;
        }
      }
      //vibrator
      if (ew.apps.kitty.state.def.is.vibrator && !kitty.vibrator.connected) {
        try { kitty.vibrator.connect(); }
        catch (error) { "VIB: " + console.log(error); }
      }
      ew.apps.kitty.state.is.sys.pwr = 1;
      //ew.apps.kitty.state.is.sys.busy = 1;
      pinMode(D13, "opendrain_pullup");
      pinMode(D46, "output");
      pinMode(D38, "output");

      if (ew.pin.CHRG.read()) {
        if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Waking up"), notify: true } } });
        ew.apps.kitty.state.msg("Waking up");
        digitalPulse(D38, 0, 100);
      }
      else if (!ew.pin.CHRG.read()) {
        if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Power is on"), notify: true } } });
        if (e != "recovery" && !ew.apps.kitty.state.isOnBase()) return;
        if (i) {
          if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Starting " + e ? e : i), notify: true } } });
          kitty.call[i](e ? e : "");
        } //else  ew.apps.kitty.state.is.sys.busy = 0;
        return;
      }
      if (ew.tid.kittyI) {
        clearInterval(ew.tid.kittyI);
        ew.tid.kittyI = 0;
      }
      ew.tid.kittyI = setInterval(() => {
        if (!ew.pin.CHRG.read() || !ew.apps.kitty.state.def.is.voltMon) {
          if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Power is on"), notify: true } } });
          //  
          if (ew.tid.kittyT) {
            clearTimeout(ew.tid.kittyT);
            ew.tid.kittyT = 0;
          }
          clearInterval(ew.tid.kittyI);
          ew.tid.kittyI = 0;
          if (ew.face[0].page == "more1")
            ew.UI.btn.c2l("main", "_2x3", 6, "POWER", ew.pin.CHRG.read() ? "OFF" : "ON", 15, ew.pin.CHRG.read() ? 1 : 4);
          if (e != "recovery" && !ew.apps.kitty.state.isOnBase()) return;
          if (i) {
            if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Starting " + e ? e : i), notify: true } } });
            kitty.call[i](e ? e : "");
          } //else  ew.apps.kitty.state.is.sys.busy = 0;
        }
        else if (ew.pin.CHRG.read()) {
          if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Waiting for power"), notify: true } } });
          digitalPulse(D38, 0, 100);
          //digitalPulse(D38, 1, 500);
        }
      }, 2500);
    },
    unlock: function(next) {
      if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Unlocking"), notify: true } } });
      ew.apps.kitty.state.is.sys.busy = 1;
      if (next == "clean") {
        ew.apps.kitty.state.is.sys.run++;
        next = ew.apps.kitty.state.def.sand[ew.apps.kitty.state.def.is.sandType].name;
      }

      if (ew.apps.kitty.state.def.is.lid) {
        pinMode(D27, "output");
        kitty.call.go({ servo: "lid", one: ew.apps.kitty.state.def.lid.open, act: "Opening Lid", next: "unlock", then: next, speed: 50 });
      }
      else kitty.call.go({ servo: "lock", one: 0.01, act: "Unlock", vibration: "pulse", repeat: 3, hold: 4, next: "release", then: next, speed: 25 });
    }
  },
  action: {
    count: function(i) {
      if (ew.tid.kittyI) {
        clearInterval(ew.tid.kittyI);
        ew.apps.kitty.state.is.sys.cnt = 0;
        ew.tid.kittyI = 0;
      }
      if (i) {
        if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Clear counter"), notify: true } } });
        return;
      }
      else {
        if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Start counter"), notify: true } } });
      }
      let v = 60 * ew.apps.kitty.state.def.auto.delay;
      //ew.apps.kitty.state.is.sys.busy = 0;
      ew.apps.kitty.state.msg("Hello Kitty");
      ew.tid.kittyI = setInterval(() => {
        v--;
        ew.apps.kitty.state.msg((60 * ew.apps.kitty.state.def.auto.delay - 3 <= v) ? "Hello Kitty" : "Empty in " + v);
        ew.apps.kitty.state.is.sys.cnt = v;
        if (v <= 0) {
          clearInterval(ew.tid.kittyI);
          ew.tid.kittyI = 0;
          ew.apps.kitty.state.is.sys.cnt = 0;
          if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Counter expired"), notify: true } } });
          kitty.call.wake("unlock", "clean");
        }
        else if (v <= 5) {
          //acc.sleep();
          ew.sys.buzz.nav(ew.sys.buzz.type.on);
        }
      }, 1000);
    },
    //ball movement patterns
    // trigger uvc light
    uvc: () => { kitty.call.go({ servo: "ball", one: 0.85 + ew.apps.kitty.state.def.is.clb, two: 0.65, act: "UVC-wake", next: "lock", speed: 70 }); },
    // fine grain betonite sand
    betonite: () => { kitty.call.go({ servo: "ball", one: 1 + ew.apps.kitty.state.def.is.clb, act: "Empty", hold: 1, next: "betonite1" }); },
    betonite1: () => { kitty.call.go({ servo: "ball", one: 0.01, act: "Empty", hold: 1, next: "betonite2" }); },
    betonite2: () => { kitty.call.go({ servo: "ball", one: 1.5 + ew.apps.kitty.state.def.is.clb, act: "Empty", next: "betonite3" }); },
    betonite3: () => { kitty.call.go({ servo: "ball", one: 2 + ew.apps.kitty.state.def.is.clb, act: "ToF", vibration: "pulse", repeat: 10, hold: 2, next: "betonite4" }); },
    betonite4: () => { kitty.call.go({ servo: "ball", one: 0.70 + ew.apps.kitty.state.def.is.clb, two: 0.01, act: "Level", hold: 2, next: "betonite5" }); },
    betonite5: () => { kitty.call.go({ servo: "ball", one: 0.70 + ew.apps.kitty.state.def.is.clb, act: "Return", next: "lock" }); },
    //pellet non stick, needs vibrator
    pellet: () => { kitty.call.go({ servo: "ball", one: 1 + ew.apps.kitty.state.def.is.clb, two: 0.01, three: 1.1, act: "Prepare", hold1: 2, next: "pellet1", speed: 80 }); },
    pellet1: () => { kitty.call.go({ servo: "ball", one: 1.2 + ew.apps.kitty.state.def.is.clb, act: "Empty", hold: 10, vibration: "pulse", repeat: 6, next: "pellet1_1" }); },
    pellet1_1: () => { kitty.call.go({ servo: "ball", one: 1.3 + ew.apps.kitty.state.def.is.clb, hold: 10, vibration: "pulse", repeat: 6, next: "pellet1_2" }); },
    pellet1_2: () => { kitty.call.go({ servo: "ball", one: 1.4 + ew.apps.kitty.state.def.is.clb, hold: 10, vibration: "pulse", repeat: 6, next: "pellet2" }); },
    pellet2: () => { kitty.call.go({ servo: "ball", one: 1.5 + ew.apps.kitty.state.def.is.clb, hold: 10, vibration: "pulse", repeat: 6, next: "pellet3" }); },
    pellet3: () => { kitty.call.go({ servo: "ball", one: 1.6 + ew.apps.kitty.state.def.is.clb, hold: 10, vibration: "pulse", repeat: 6, next: "pellet5" }); },
    pellet4: () => { kitty.call.go({ servo: "ball", one: 1.9 + ew.apps.kitty.state.def.is.clb, hold: 6, vibration: "pulse", repeat: 4, next: "pellet5" }); },
    pellet5: () => { kitty.call.go({ servo: "ball", one: 2.0 + ew.apps.kitty.state.def.is.clb, act: "ToF", hold: 6, vibration: "pulse", repeat: 8, next: "pellet6", speed: "200" }); },
    pellet6: () => { kitty.call.go({ servo: "ball", one: 0.5 + ew.apps.kitty.state.def.is.clb, hold: 1, next: "pellet10" }); },
    pellet7: () => { kitty.call.go({ servo: "ball", one: 0.4 + ew.apps.kitty.state.def.is.clb, hold: 3, vibration: "pulse", repeat: 4, next: "pellet8" }); },
    pellet8: () => { kitty.call.go({ servo: "ball", one: 0.3 + ew.apps.kitty.state.def.is.clb, hold: 3, vibration: "pulse", repeat: 4, next: "pellet9" }); },
    pellet9: () => { kitty.call.go({ servo: "ball", one: 0.2 + ew.apps.kitty.state.def.is.clb, hold: 3, vibration: "pulse", repeat: 4, next: "pellet10" }); },
    pellet10: () => { kitty.call.go({ servo: "ball", one: 0.1 + ew.apps.kitty.state.def.is.clb, next: "pellet11" }); },
    pellet11: () => { kitty.call.go({ servo: "ball", one: 0.01, hold: 30, vibration: "turnOn", next: "pellet12" }); },
    pellet12: () => { kitty.call.go({ servo: "ball", one: 0.02, two: 0.01, hold: 30, vibration: "turnOn", next: "pellet13" }); },
    pellet13: () => { kitty.call.go({ servo: "ball", one: 0.65 + ew.apps.kitty.state.def.is.clb, vibration: "turnOff", next: "pellet14" }); },
    pellet14: () => { kitty.call.go({ servo: "ball", one: 0.70 + ew.apps.kitty.state.def.is.clb, act: "Return", next: "lock" }); },

    // standard non-stick sand
    nonstick: () => { kitty.call.go({ servo: "ball", one: 1 + ew.apps.kitty.state.def.is.clb, two: 0.01, three: 1.2, act: "Prepare", next: "nonstick_1", speed: 50 }); },
    nonstick_1: () => { kitty.call.go({ servo: "ball", one: 1.4 + ew.apps.kitty.state.def.is.clb, two: 1.35, three: 1.4, act: "Step 1", next: "nonstick_2", speed: 80 }); },
    nonstick_2: () => { kitty.call.go({ servo: "ball", one: 1.5 + ew.apps.kitty.state.def.is.clb, two: 1.45, three: 1.5, act: "Step 2", next: "nonstick_3", speed: 80 }); },
    nonstick_3: () => { kitty.call.go({ servo: "ball", one: 1.6 + ew.apps.kitty.state.def.is.clb, two: 1.55, three: 1.6, act: "step 3", next: "nonstick_4", speed: 80 }); },
    nonstick_4: () => { kitty.call.go({ servo: "ball", one: 1.75 + ew.apps.kitty.state.def.is.clb, two: 1.70, three: 1.95 + ew.apps.kitty.state.def.is.clb, act: "ToF", next: "nonstick_5", speed: 80 }); },
    nonstick_5: () => { kitty.call.go({ servo: "ball", one: 2 + ew.apps.kitty.state.def.is.clb, two: 1.95, act: "Empty", next: "nonstick_6", speed: 80 }); },
    nonstick_6: () => { kitty.call.go({ servo: "ball", one: 2 + ew.apps.kitty.state.def.is.clb, two: 0.01, act: "Level", next: "nonstick_7", speed: 80 }); },
    nonstick_7: () => { kitty.call.go({ servo: "ball", one: 0.02, two: 0.01, act: "Wait", next: "nonstick_8" }); },
    nonstick_8: () => { kitty.call.go({ servo: "ball", one: 1 + ew.apps.kitty.state.def.is.clb, two: 0.01, three: 0.70 + ew.apps.kitty.state.def.is.clb, act: "Return", next: "lock", speed: 80 }); },
    // silicone crystals
    silicone: () => { kitty.call.go({ servo: "ball", one: 1 + ew.apps.kitty.state.def.is.clb, two: 0.01, three: 1.3, act: "Prepare", hold1: 2, next: "silicone1", speed: 80 }); },
    silicone1: () => { kitty.call.go({ servo: "ball", one: 1.4 + ew.apps.kitty.state.def.is.clb, act: "Empty", hold: 3, vibration: "turnOn", next: "silicone2" }); },
    silicone2: () => { kitty.call.go({ servo: "ball", one: 1.5 + ew.apps.kitty.state.def.is.clb, hold: 3, vibration: "turnOn", next: "silicone3" }); },
    silicone3: () => { kitty.call.go({ servo: "ball", one: 1.95 + ew.apps.kitty.state.def.is.clb, act: "ToF", hold: 3, vibration: "turnOn", next: "silicone4" }); },
    silicone4: () => { kitty.call.go({ servo: "ball", one: 0.5 + ew.apps.kitty.state.def.is.clb, hold: 3, next: "silicone5" }); },
    silicone5: () => { kitty.call.go({ servo: "ball", one: 0.4 + ew.apps.kitty.state.def.is.clb, hold: 3, vibration: "turnOn", next: "silicone6" }); },
    silicone6: () => { kitty.call.go({ servo: "ball", one: 0.3 + ew.apps.kitty.state.def.is.clb, hold: 3, vibration: "turnOn", next: "silicone7" }); },
    silicone7: () => { kitty.call.go({ servo: "ball", one: 0.2 + ew.apps.kitty.state.def.is.clb, hold: 3, vibration: "turnOn", next: "silicone8" }); },
    silicone8: () => { kitty.call.go({ servo: "ball", one: 0.1 + ew.apps.kitty.state.def.is.clb, hold: 3, vibration: "turnOn", next: "silicone9" }); },
    silicone9: () => { kitty.call.go({ servo: "ball", one: 0.01, hold: 4, vibration: "turnOn", next: "silicone10" }); },
    silicone10: () => { kitty.call.go({ servo: "ball", one: 0.70 + ew.apps.kitty.state.def.is.clb, act: "Return", vibration: "turnOff", next: "lock" }); },
    //tofu
    tofu: () => { kitty.call.go({ servo: "ball", one: 1 + ew.apps.kitty.state.def.is.clb, two: 0.01, three: 1.50 + ew.apps.kitty.state.def.is.clb, act: "Empty", next: "tofu1" }); },
    tofu1: () => { kitty.call.go({ servo: "ball", one: 1.99 + ew.apps.kitty.state.def.is.clb, act: "ToF", vibration: "turnOn", hold: 5, next: "tofu2" }); },
    tofu2: () => { kitty.call.go({ servo: "ball", one: 0.5 + ew.apps.kitty.state.def.is.clb, act: "Level", vibration: "turnOff", next: "tofu3" }); },
    tofu3: () => { kitty.call.go({ servo: "ball", one: 0.01, act: "Vibrate", vibration: "turnOn", hold: 15, next: "tofu4" }); },
    tofu4: () => { kitty.call.go({ servo: "ball", one: 0.70 + ew.apps.kitty.state.def.is.clb, act: "Return", vibration: "turnOff", next: "lock" }); },
    // empty sand
    /*empty: () => { kitty.call.go({servo: "ball", one: 1.6 + ew.apps.kitty.state.def.is.clb, act: "Empty Sand", next: "empty1" }); },
    empty1: () => { kitty.call.go({servo: "ball", one: 1.65 + ew.apps.kitty.state.def.is.clb, vibration: "turnOn", next: "empty2" }); },
    empty2: () => { kitty.call.go({servo: "ball", one: 1.95 + ew.apps.kitty.state.def.is.clb, hold: 4, next: "empty3" }); },
    empty3: () => { kitty.call.go({servo: "ball", one: 1.95 + ew.apps.kitty.state.def.is.clb, two: 1.0, vibration: "turnOff", next: "empty4", speed: 50 }); },
    empty4: () => { kitty.call.go({servo: "ball", one: 1.7 + ew.apps.kitty.state.def.is.clb, next: "empty5" }); },
    empty5: () => { kitty.call.go({servo: "ball", one: 1.75 + ew.apps.kitty.state.def.is.clb, vibration: "turnOn", next: "empty6" }); },
    empty6: () => { kitty.call.go({servo: "ball", one: 2.0 + ew.apps.kitty.state.def.is.clb, hold: 4, next: "empty7", speed: 50 }); },
    empty7: () => { kitty.call.go({servo: "ball", one: 2.0 + ew.apps.kitty.state.def.is.clb, two: 1.0, three: 2.0 + ew.apps.kitty.state.def.is.clb, vibration: "turnOff", next: "empty11", speed: 50 }); },
    empty11: () => { kitty.call.go({servo: "ball", one: 2 + ew.apps.kitty.state.def.is.clb, two: 0.65 + ew.apps.kitty.state.def.is.clb, act: "Return", next: "lock" }); },
    */
    //empty1: () => { kitty.call.go({servo: "ball", one: 2 + ew.apps.kitty.state.def.is.clb, two: 0.65, act: "Take 2", next: "empty2", speed: 50 }); },
    //empty2: () => { kitty.call.go({servo: "ball", one: 2 + ew.apps.kitty.state.def.is.clb, two: 0.65, act: "Take 3", next: "empty3", speed: 50 }); },
    //empty3: () => { kitty.call.go({servo: "ball", one: 2, two: 0.65, act: "Return", next: "lock"}); },
    //
    empty: () => { kitty.call.go({ servo: "ball", one: 1.70 + ew.apps.kitty.state.def.is.clb, act: "Empty Sand", hold: 1, next: "empty1" }); },
    empty1: () => { kitty.call.go({ servo: "ball", one: 1.80 + ew.apps.kitty.state.def.is.clb, hold: 5, vibration: "pulse", repeat: 4, next: "empty2" }); },
    empty2: () => { kitty.call.go({ servo: "ball", one: 1.90 + ew.apps.kitty.state.def.is.clb, hold: 5, vibration: "pulse", repeat: 4, next: "empty3" }); },
    empty3: () => { kitty.call.go({ servo: "ball", one: 1.80 + ew.apps.kitty.state.def.is.clb, hold: 5, vibration: "pulse", repeat: 4, next: "empty4" }); },
    empty4: () => { kitty.call.go({ servo: "ball", one: 1.70 + ew.apps.kitty.state.def.is.clb, hold: 5, vibration: "pulse", repeat: 4, next: "empty5" }); },
    empty5: () => { kitty.call.go({ servo: "ball", one: 1.80 + ew.apps.kitty.state.def.is.clb, hold: 5, vibration: "pulse", repeat: 4, next: "empty6" }); },
    empty6: () => { kitty.call.go({ servo: "ball", one: 2.0 + ew.apps.kitty.state.def.is.clb, hold: 5, vibration: "pulse", repeat: 4, next: "empty7", speed: 50 }); },
    empty7: () => { kitty.call.go({ servo: "ball", one: 2 + ew.apps.kitty.state.def.is.clb, two: 0.70 + ew.apps.kitty.state.def.is.clb, act: "Return", next: "lock" }); },
    //empty1: () => { kitty.call.go({servo: "ball", one: 2 + kitty
    recovery: () => { kitty.call.go({ servo: "ball", one: 0.3, two: 0.2, act: "Recovery", next: "recovery1" }); },
    recovery1: () => { kitty.call.go({ servo: "ball", one: 0.01, hold: 5, vibration: "turnOn", act: "Recovery", next: "recovery2" }); },
    recovery2: () => { kitty.call.go({ servo: "ball", one: 0.70 + ew.apps.kitty.state.def.is.clb, act: "Recovery", vibration: "turnOff", next: "lock" }); },
    //
    lock: () => { kitty.call.go({ servo: "lock", one: 1, act: "Lock", vibration: "pulse", repeat: 3, hold: 4, next: "secure", speed: 25 }); },
    secure: () => { kitty.call.go({ servo: "ball", one: 0.45 + ew.apps.kitty.state.def.is.clb, two: 0.15 + ew.apps.kitty.state.def.is.clb, three: 0.45 + ew.apps.kitty.state.def.is.clb, act: "Secure", next: ew.apps.kitty.state.def.is.lid ? "lid_close" : "sleep" }); },
    lid_close: () => { kitty.call.go({ servo: "lid", one: ew.apps.kitty.state.def.lid.shut, act: "Closing Lid", next: "sleep", speed: 50 }); },
    //
    unlock: (next) => { kitty.call.go({ servo: "lock", one: 0.01, vibration: "pulse", repeat: 3, hold: 4, act: "Unlock", next: "release", then: next, speed: 25 }); },
    release: (next) => { kitty.call.go({ servo: "ball", one: 0.42 + ew.apps.kitty.state.def.is.clb, two: 0.15 + ew.apps.kitty.state.def.is.clb, three: 0.42 + ew.apps.kitty.state.def.is.clb, act: "Release", next: next }); },
    //
    lid: (action, next) => { kitty.call.go({ servo: "lid", one: action ? ew.apps.kitty.state.def.lid.open : ew.apps.kitty.state.def.lid.shut, act: action ? "Opening Lid" : "Closing Lid", next: next ? next : "", speed: 50 }); },
    //
    sleep: (full) => {
      if (ew.tid.kittyT) {
        clearTimeout(ew.tid.kittyT);
        ew.tid.kittyT = 0;
      }
      if (ew.tid.kittyI) {
        clearInterval(ew.tid.kittyI);
        ew.tid.kittyI = 0;
      }
      ew.apps.kitty.state.msg("Going to Sleep", 0);
      ew.apps.kitty.state.is.sys.tap = 0;
      if (!ew.pin.CHRG.read()) digitalPulse(D38, 0, [100, 200, 100]);
      if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Going to sleep"), notify: true } } });
      ew.tid.kittyT = setTimeout(() => {
        ew.tid.kittyT = 0;
        if (ew.pin.CHRG.read()) {
          ew.apps.kitty.state.msg("Bye bye", 0);
          if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("sleeping"), notify: true } } });
          ew.apps.kitty.state.is.sys.pwr = 0;
          poke32(0x50000700 + 13 * 4, 2);
          poke32(0x50000700 + 46 * 4, 2);
          //poke32(0x50000700 + 27 * 4, 2);
          ew.apps.kitty.state.is.sys.pause = 0;
          if (ew.apps.kitty.state.def.is.vibrator == 1) kitty.vibrator.disconnect();
          if (ew.apps.kitty.state.is.auto.uvc) {
            if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("UVC wake scheduled"), notify: true } } });
            ew.apps.kitty.state.is.auto.uvc = 0;
            ew.tid.kittyT = setTimeout(() => {
              ew.tid.kittyT = 0;
              kitty.call.wake("unlock", "uvc");
            }, 180000);
          }
          ew.apps.kitty.state.is.sys.manual=0;
          ew.apps.kitty.state.is.sys.busy = 0;
          if (ew.face[0].page == "more1")
            ew.UI.btn.c2l("main", "_2x3", 6, "POWER", ew.pin.CHRG.read() ? "OFF" : "ON", 15, ew.pin.CHRG.read() ? 1 : 4);
          if (full) ew.do.sysSleep();
        }
        else {
          if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Sleep failed"), notify: true } } });
          ew.tid.kittyT = setTimeout(() => {
            ew.tid.kittyT = 0;
            kitty.action.sleep(full ? 1 : 0);
          }, 1500);
        }
      }, 2500);
    }
  }
};
//events
//BT
ew.on("BTRXcmd", (i) => {
  if (i.startsWith(1)) {
    if (i == 11) ew.emit('button', 'short');
    else if (i == 12) ew.emit('button', 'long');
    else if (i == 13) ew.emit('button', 'triple');
    else if (i == 14) ew.apps.kitty.state.print();
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
// button
ew.on("button", (x) => {
  if (ew.apps.kitty.state.is.sys.busy) {
    if (x == "long") {
      ew.apps.kitty.state.msg(ew.apps.kitty.state.is.sys.pause ? "Resuming" : "Paused", ew.apps.kitty.state.is.sys.pause ? 0 : 1);
      //ew.apps.kitty.state.msg(ew.apps.kitty.state.is.sys.pause ? "Resuming" : "Paused", 0);
      ew.apps.kitty.state.is.sys.pause = 1 - ew.apps.kitty.state.is.sys.pause;
      return;
    }
    ew.sys.buzz.nav(300);
    ew.apps.kitty.state.msg("I am busy", 0);
    return;
  }

  else if (x == "short") {
    ew.apps.kitty.state.msg(!ew.pin.CHRG.read() ? "Going to sleep" : "Waking up");
    ew.apps.kitty.state.is.sys.manual=1;
    !ew.pin.CHRG.read() ? kitty.action.sleep() : kitty.call.wake();
  }

  else if (x == "triple") {
    ew.sys.buzz.nav(ew.sys.buzz.type.ok);
    if (ew.face.appCurr != "clock" || ew.face.pageCurr == -1)
      ew.face.go("main", 0);
    ew.apps.kitty.state.is.sys.manual=1; 
    scale.clean(0);
    kitty.call.wake("unlock", "empty");
  }

  else if (x == "long") {
    ew.sys.buzz.nav(ew.sys.buzz.type.ok);
    if (ew.face.appCurr != "clock" || ew.face.pageCurr == -1)
      ew.face.go("main", 0);
    ew.apps.kitty.state.is.sys.manual=1; 
    scale.clean(0);
    kitty.call.wake("unlock", "clean");
  }
});

//cron
cron.on('hour', (x) => {
  //console.log("log- ","hour",x);
  if (ew.apps.kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("hour :" + x), notify: true } } });
  if (x == 0) {
    ew.apps.kitty.state.def.is.total = ew.apps.kitty.state.def.is.total + ew.apps.kitty.state.is.sys.run;
    ew.apps.kitty.state.is.sys.run = 0;
    ew.apps.kitty.state.update();
  }
});
//defaults
if (!require('Storage').read("kitty.json")) {
  ew.apps.kitty.state.def = {
    is: {
      sandType: 1,
      fail: 3,
      clb: 0,
      total: 0,
      voltMon: 1,
      lockType: 1,
      scale: 1,
      tof: 1,
      lid: 0,
      vibrator: 1
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
      1: { name: "betonite", speed: 1, max: 3600, min: 1000 },
      2: { name: "silicone", speed: 1, max: 1800, min: 500 },
      3: { name: "pellet", speed: 1, max: 2800, min: 800 },
      4: { name: "tofu", speed: 1, max: 2000, min: 800 }
    },
    tof: {
      lost: 6553.5,
      empty: 43.5,
      full: 37
    },
    scale: {
      lsbGrams: -0.02211579162,
      zero: -369874,
      lost: -8180,
      ball: 1350,
      empty: 1000,
      full: 3700
    },
    lid: {
      open: 0.55,
      shut: 0.03
    }
  };
  ew.apps.kitty.state.update();
}
else ew.apps.kitty.state.def = require('Storage').readJSON("kitty.json");
//init
ew.tid.kittyT = setTimeout(() => {
  NRF.on('disconnect', function() {
    if (ew.tid.nrf) {
      clearInterval(ew.tid.nrf);
      ew.tid.nrf = 0;
    }
    ew.apps.kitty.state.is.nrf = 0;
  });
  NRF.on('connect', function() {
    if (ew.tid.nrf) clearInterval(ew.tid.nrf);
    //ew.apps.kitty.state.is.nrf = 1;
    ew.tid.nrf = setInterval(function() {
      ew.apps.kitty.state.print();
    }, 1000);
  });

  //ew.apps.kitty.state.is.nrf = 1;
  ew.tid.kittyT = 0;
  NRF.restart();
  //ew.updateBT();
  NRF.setTxPower(4);
  ew.tid.charge = 0;
  //kitty.action.sleep();
}, 1000);
