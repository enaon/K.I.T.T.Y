// MIT License (c) 2024 enaon https://github.com/enaon
// see full license text at https://choosealicense.com/licenses/mit/

//setup
E.setConsole(Bluetooth, { force: true });
Serial1.unsetup();
pinMode(D22, "opendrain", true);
pinMode(D23, "opendrain", true);

//kitty app
kitty = {
  state: {
    is: {
      sys: { busy: 0, run: 0, pause: 0, tap: 0, pwr: 0, cnt: 0, abort: 0 },
      auto: { uvc: 0 },
      pos: { lock: 0.2, ball: 0.45, flip: 0, dir: 0 },
      volt: { drop: 0, base: 0, min: 0, failed: 0, litres: 0 },
      tof: { dist: 0, per: 0, state: "na" }
    },
    print: function() {
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "lt=" + kitty.state.is.volt.litres, notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "rtod=" + kitty.state.is.sys.run, notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "rtot=" + (kitty.state.is.sys.run + kitty.state.def.is.total), notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "ps=" + kitty.state.is.sys.pause, notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "sp=" + kitty.state.def.is.sand, notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "ss=" + (19 - (kitty.state.def.sandType[kitty.state.def.is.sand].speed * 10)), notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "ac=" + kitty.state.def.auto.clean, notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "ad=" + kitty.state.def.auto.delay, notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "au=" + kitty.state.def.auto.uvc, notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "vp=" + ew.is.ondcVoltage(), notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "pp=" + ew.is.ondcVoltage(1), notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "vc=" + ew.is.batt(), notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "dt=" + Date().toString().split(' ')[4], notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "pwr=" + kitty.state.is.sys.pwr, notify: true } } });
      NRF.updateServices({ 0xffa0: { 0xffa2: { value: "busy=" + kitty.state.is.sys.busy, notify: true } } });
    },
    update: function() { require('Storage').write('kitty.json', kitty.state.def); }
  },
  call: {
    move: function(pin, pos, range) {
      i = range ? 0.5 : 1;
      if (pos <= 0) pos = 0;
      if (pos >= 1 / i) pos = 1 / i;
      analogWrite(pin, (i + pos) / 50.0, { freq: 20, soft: true });
    },
    go: function(i) {
      if (ew.tid.kittyI) {
        clearInterval(ew.tid.kittyI);
        ew.tid.kittyI = 0;
      }
      if (kitty.dbg) console.log("go start", i, kitty.state.is.pos);
      kitty.state.is.sys.abort = 0;
      kitty.state.is.pos.flip = 0;
      kitty.state.is.pos.dir = 0;
      if (!i.speed) i.speed = 100;
      kitty.state.is.volt.base = ew.is.ondcVoltage();
      if (i.act == "Emptying") kitty.state.is.volt.min = kitty.state.is.volt.base;
      //messasge
      if (i.act) {
        ew.oled.msg(i.act, 1);
        if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString(i.act), notify: true } } });
      }
      //loop
      ew.tid.kittyI = setInterval(() => {
        if (i.act == "Emptying" && (ew.is.ondcVoltage() < kitty.state.is.volt.min)) {
          kitty.state.is.volt.min = ew.is.ondcVoltage();
        }
        if (kitty.dbg) console.log("inside loop", i, kitty.state.is.pos);

        //set custom movement speed
        if (i.act != "Locking") changeInterval(ew.tid.kittyI, i.speed * kitty.state.def.sandType[kitty.state.def.is.sand].speed);
        //direction
        if (!kitty.state.is.pos.flip) {
          if (!kitty.state.is.pos.dir) kitty.state.is.pos.dir = (kitty.state.is.pos.ball <= i.one) ? "up" : "dn";
          if (kitty.state.is.pos.dir == "up" && i.one <= kitty.state.is.pos.ball)
            kitty.state.is.pos.flip = 1;
          else if (kitty.state.is.pos.dir == "dn" && kitty.state.is.pos.ball <= i.one)
            kitty.state.is.pos.flip = 1;
        }
        else kitty.state.is.pos.dir = 0;
        if (kitty.state.is.pos.flip == 1 && !i.two) kitty.state.is.pos.flip = 3;
        else if (kitty.state.is.pos.flip == 1 && (kitty.state.is.pos.ball <= i.two || kitty.state.is.pos.ball <= 0.01)) kitty.state.is.pos.flip = i.three ? 2 : 3;
        else if (kitty.state.is.pos.flip == 2 && i.three <= kitty.state.is.pos.ball) kitty.state.is.pos.flip = 3;
        if (kitty.state.is.pos.flip == 3) {
          clearInterval(ew.tid.kittyI);
          ew.tid.kittyI = 0;
          if (i.act == "Emptying") {
            if (kitty.state.def.auto.uvc) kitty.state.is.auto.uvc = 1;
            kitty.state.is.volt.drop = kitty.state.is.volt.base - kitty.state.is.volt.min;
            kitty.state.is.volt.litres = (kitty.state.is.volt.drop * (40 - (kitty.state.is.volt.drop * 50))).toFixed(1);
          }
          if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString(i.act + " done"), notify: true } } });
          if (i.next) {
            if (i.hold) setTimeout(() => { kitty.action[i.next](); }, i.hold * 1000);
            else kitty.action[i.next]();
          }
          return;
        }
        //recovery
        if (kitty.state.def.is.voltMon && (ew.is.ondcVoltage() <= kitty.state.def.is.fail || kitty.state.is.sys.abort)) {
          kitty.state.is.volt.failed = ew.is.ondcVoltage();
          if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("power down-recovery"), notify: true } } });
          clearInterval(ew.tid.kittyI);
          ew.tid.kittyI = 0;
          if (!kitty.state.is.sys.abort) {
            kitty.state.is.pos.ball = kitty.state.is.pos.ball + (kitty.state.is.pos.flip == 1 ? 0.25 : -0.25);
            kitty.call.move(D22, kitty.state.is.pos.ball, 1);
          }
          if (ew.tid.kittyT) {
            clearTimeout(ew.tid.kittyT);
            ew.tid.kittyT = 0;
          }
          ew.tid.kittyT = setTimeout(() => {
            ew.tid.kittyT = 0;
            kitty.call.wake("sand", "recovery");
          }, 1500);
        }
        //movement
        else if (!kitty.state.is.sys.pause && kitty.state.is.pos.flip != 3) {
          if ((i.act == "Locking" || i.act == "Release") && 0.07 <= kitty.state.is.volt.base - ew.is.ondcVoltage() && kitty.state.is.pos.flip == 1)
            kitty.state.is.pos.flip = 2;
          //kitty.state.is.pos.ball = kitty.state.is.pos.ball + (kitty.state.is.pos.flip == 1 ? -0.01 : 0.01);
          kitty.state.is.pos.ball = kitty.state.is.pos.ball + (kitty.state.is.pos.flip == 1 ? -0.01 : kitty.state.is.pos.dir == "dn" ? -0.01 : 0.01);
          //console.log(i.act,kitty.state.is.pos.dir,kitty.state.is.pos.flip, kitty.state.is.pos.ball);
          if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa2: { value: "pos=" + (kitty.state.is.pos.ball * 100).toString(), notify: true } } });
          kitty.call.move(D22, kitty.state.is.pos.ball, 1);
        }

      }, i.speed);
    },
    wake: function(i, e) {
      kitty.action.count("stop");
      if (ew.tid.kittyT) {
        clearTimeout(ew.tid.kittyT);
        ew.tid.kittyT = 0;
      }
      if (e && e != "recovery" && ew.is.ondcVoltage() < 3.35) {
        if (3 <= ew.is.ondcVoltage()) {
          if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("low battery"), notify: true } } });
          ew.oled.msg("Low Battery");
        }
        else {
          if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("no drawer/power"), notify: true } } });
          ew.oled.msg("No Drawer/Power");
        }
        if (kitty.state.def.is.voltMon) return;
      }

      if (ew.is.ondcVoltage() <= 4.4 && 3.3 <= ew.is.ondcVoltage()) {
        if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("waking up"), notify: true } } });
        ew.oled.msg("Waking up");
        digitalPulse(D23, 1, [200, 100, 200]);
      }
      else if (4.4 <= ew.is.ondcVoltage()) {
        if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("power already on"), notify: true } } });
        kitty.state.is.sys.pwr = 1;
        if (i) {
          //if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("starting " + i + " " + (e ? e : "")), notify: true } } });

          kitty.action[i](e ? e : "");
        } //else  kitty.state.is.sys.busy = 0;
        return;
      }
      if (ew.tid.kittyI) {
        clearInterval(ew.tid.kittyI);
        ew.tid.kittyI = 0;
      }
      ew.tid.kittyI = setInterval(() => {
        if (4.4 <= ew.is.ondcVoltage() || !kitty.state.def.is.voltMon) {
          kitty.state.is.sys.pwr = 1;
          if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("power is on"), notify: true } } });
          //  
          if (ew.tid.kittyT) {
            clearTimeout(ew.tid.kittyT);
            ew.tid.kittyT = 0;
          }
          clearInterval(ew.tid.kittyI);
          ew.tid.kittyI = 0;
          if (i) {
            //if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("starting " + i + " " + (e ? e : "")), notify: true } } });
            kitty.action[i](e ? e : "");
          } //else  kitty.state.is.sys.busy = 0;
        }
        else if (3 <= ew.is.ondcVoltage()) {
          if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("waiting for power"), notify: true } } });
          digitalPulse(D23, 1, 500);
        }
        else {
          if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Drawer missing"), notify: true } } });
          ew.oled.msg("Drawer missing");
        }
      }, 1500);
    },
    unlock: function(mode) {
      if (ew.tid.kittyI) clearInterval(ew.tid.kittyI);

      let c = 0.95;
      ew.tid.kittyI = setInterval(() => {
        kitty.call.move(D23, c);
        c = c - 0.01;
        if (c <= 0.01) {
          clearInterval(ew.tid.kittyI);
          ew.tid.kittyI = 0;
          if (mode)
            kitty.call.go({ one: 0.52 + kitty.state.def.is.clb, two: 0.15 + kitty.state.def.is.clb, three: 0.38 + kitty.state.def.is.clb, act: "Release", next: mode });
        }
      }, 20);
    }
  },
  action: {
    count: function(i) {
      if (ew.tid.kittyI) {
        clearInterval(ew.tid.kittyI);
        ew.tid.kittyI = 0;
        kitty.state.is.sys.cnt = 0;
      }
      if (i) {
        if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Clear counter"), notify: true } } });
        return;
      }
      else {
        if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Start counter"), notify: true } } });
      }
      let v = 60 * kitty.state.def.auto.delay;
      //kitty.state.is.sys.busy = 0;
      ew.oled.msg("Hello Kitty");
      ew.tid.kittyI = setInterval(() => {
        v--;
        ew.oled.msg((60 * kitty.state.def.auto.delay - 3 <= v) ? "Hello Kitty" : "Empty in " + v);
        kitty.state.is.sys.cnt = v;
        if (v == (kitty.state.def.auto.delay * 60) - 40)
          digitalPulse(D23, 0, [200, 300, 200, 300, 200]);
        else if (v <= 0) {
          clearInterval(ew.tid.kittyI);
          ew.tid.kittyI = 0;
          kitty.state.is.sys.cnt = 0;
          if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Counter expired"), notify: true } } });
          kitty.call.wake("sand", "clean");
        }
        else if (v <= 5) {
          acc.sleep();
          buzzer([200, 100, 100]);
        }
      }, 1000);
    },

    paterns: {
      
      //uvc light
      uvc: { one: 0.85 + kitty.state.def.is.clb, two: 0.65, act: "Turn on UVC", next: "lock", speed: 70 },
      
      // fine grain betonite sand
      betonite: { one: 1 + kitty.state.def.is.clb, two: 0.01, three: 2 + kitty.state.def.is.clb, act: "Empty", hold: 2, next: "betonite1", speed: 100 },
      betonite1: { one: 0.01, act: "Level", hold: 3, next: "betonite2", speed: 100 },
      betonite2: { one: 0.70 + kitty.state.def.is.clb, act: "Return", next: "lock", speed: 100 },
      
      // standard non-stick sand
      nonstick: { one: 1 + kitty.state.def.is.clb, two: 0.01, three: 1.2, act: "Preparing", next: "nonstick_1", speed: 50 },
      nonstick_1: { one: 1.4 + kitty.state.def.is.clb, two: 1.35, three: 1.4, act: "Step 1", act2: "Returning", next: "nonstick_2", speed: 80 },
      nonstick_2: { one: 1.5 + kitty.state.def.is.clb, two: 1.45, three: 1.5, act: "Step 2", act2: "Returning", next: "nonstick_3", speed: 80 },
      nonstick_3: { one: 1.6 + kitty.state.def.is.clb, two: 1.55, three: 1.6, act: "Step 3", act2: "Returning", next: "nonstick_4", speed: 80 },
      nonstick_4: { one: 1.7 + kitty.state.def.is.clb, two: 1.65, three: 1.95, act: "Step 4", act2: "Returning", next: "nonstick_5", speed: 50 },
      nonstick_5: { one: 2 + kitty.state.def.is.clb, two: 1.95, act: "Return", act2: "Returning", next: "nonstick_6", speed: 150 },
      nonstick_6: { one: 2 + kitty.state.def.is.clb, two: 0.01, act: "Emptying", next: "nonstick_7", speed: 50 },
      nonstick_7: { one: 0.05, two: 0.01, act: "wait", next: "nonstick_8", speed: 100 },
      nonstick_8: { one: 1 + kitty.state.def.is.clb, two: 0.01, three: 0.70 + kitty.state.def.is.clb, act: "end", next: "lock", speed: 50 },

      // light crystalic silicone sand
      silicone: { one: 1 + kitty.state.def.is.clb, two: 0.01, three: 1.2, act: "Preparing", next: "silicone1", speed: 80 },
      silicone1: { one: 1.4 + kitty.state.def.is.clb, two: 1.35, three: 1.4, act: "Step 1", act2: "Returning", next: "silicone2", speed: 100 },
      silicone2: { one: 1.5 + kitty.state.def.is.clb, two: 1.45, three: 1.5, act: "Step 2", act2: "Returning", next: "silicone3", speed: 100 },
      silicone3: { one: 1.6 + kitty.state.def.is.clb, two: 1.55, three: 1.6, act: "Step 3", act2: "Returning", next: "silicone4", speed: 100 },
      silicone4: { one: 1.7 + kitty.state.def.is.clb, two: 1.65, three: 1.7, act: "Step 4", act2: "Returning", next: "silicone5", speed: 100 },
      silicone5: { one: 2 + kitty.state.def.is.clb, two: 0.01, three: 0.65, act: "step5", act2: "Returning", next: "silicone6", speed: 100 },
      silicone6: { one: 1 + kitty.state.def.is.clb, two: 0.01, three: 0.70 + kitty.state.def.is.clb, act: "Emptying", act2: "Returning", next: "lock", speed: 100 },
      
      // empty sand
      empty: { one: 2 + kitty.state.def.is.clb, two: 0.65, act: "Emptying Sand", next: "empty1" },
      empty1: { one: 2 + kitty.state.def.is.clb, two: 0.65, act: "Take 2", next: "empty2", speed: 50 },
      empty2: { one: 2 + kitty.state.def.is.clb, two: 0.65, act: "Take 3", next: "empty3", speed: 50 },
      empty3: { one: 2, two: 0.70 + kitty.state.def.is.clb, act: "Returning", next: "lock", speed: 100 },
      
      //recovery
      recovery: { one: 0.45, two: 0.01, three: 0.70 + kitty.state.def.is.clb, act: "recover", next: "lock" },


    },








    sand: function(mode) {
      // if (kitty.state.is.sys.busy) return;
      kitty.state.is.sys.busy = 1;
      //kitty.state.is.volt.base = ew.is.ondcVoltage();
      if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("Acc sleep"), notify: true } } });
      if (mode == "clean") {
        kitty.state.is.sys.run++;
        kitty.state.def.is.total++;
        mode = kitty.state.def.sandType[kitty.state.def.is.sand].name;
      }
      else if (mode == "empty") kitty.state.is.sys.run = 0;
      if (mode) kitty.call.unlock(mode);
    },

    //ball movement patterns
    // trigger uvc light
    uvc: () => { kitty.call.go({ one: 0.85 + kitty.state.def.is.clb, two: 0.65, act: "Turn on UVC", next: "lock", speed: 70 }); },
    // fine grain betonite sand
    betonite: () => { kitty.call.go({ one: 1 + kitty.state.def.is.clb, two: 0.01, three: 2 + kitty.state.def.is.clb, act: "Empty", hold: 2, next: "betonite1", speed: 100 }); },
    betonite1: () => { kitty.call.go({ one: 0.01, act: "Level", hold: 3, next: "betonite2", speed: 100 }); },
    betonite2: () => { kitty.call.go({ one: 0.70 + kitty.state.def.is.clb, act: "Return", next: "lock", speed: 100 }); },
    // standard non-stick sand
    nonstick: () => { kitty.call.go({ one: 1 + kitty.state.def.is.clb, two: 0.01, three: 1.2, act: "Preparing", next: "nonstick_1", speed: 50 }); },
    nonstick_1: () => { kitty.call.go({ one: 1.4 + kitty.state.def.is.clb, two: 1.35, three: 1.4, act: "Step 1", act2: "Returning", next: "nonstick_2", speed: 80 }); },
    nonstick_2: () => { kitty.call.go({ one: 1.5 + kitty.state.def.is.clb, two: 1.45, three: 1.5, act: "Step 2", act2: "Returning", next: "nonstick_3", speed: 80 }); },
    nonstick_3: () => { kitty.call.go({ one: 1.6 + kitty.state.def.is.clb, two: 1.55, three: 1.6, act: "Step 3", act2: "Returning", next: "nonstick_4", speed: 80 }); },
    nonstick_4: () => { kitty.call.go({ one: 1.7 + kitty.state.def.is.clb, two: 1.65, three: 1.95, act: "Step 4", act2: "Returning", next: "nonstick_5", speed: 50 }); },
    nonstick_5: () => { kitty.call.go({ one: 2 + kitty.state.def.is.clb, two: 1.95, act: "Return", act2: "Returning", next: "nonstick_6", speed: 150 }); },
    nonstick_6: () => { kitty.call.go({ one: 2 + kitty.state.def.is.clb, two: 0.01, act: "Emptying", next: "nonstick_7", speed: 50 }); },
    nonstick_7: () => { kitty.call.go({ one: 0.05, two: 0.01, act: "wait", next: "nonstick_8", speed: 100 }); },
    nonstick_8: () => { kitty.call.go({ one: 1 + kitty.state.def.is.clb, two: 0.01, three: 0.70 + kitty.state.def.is.clb, act: "end", next: "lock", speed: 50 }); },

    // light crystalic silicone sand
    silicone: () => { kitty.call.go({ one: 1 + kitty.state.def.is.clb, two: 0.01, three: 1.2, act: "Preparing", next: "silicone1", speed: 80 }); },
    silicone1: () => { kitty.call.go({ one: 1.4 + kitty.state.def.is.clb, two: 1.35, three: 1.4, act: "Step 1", act2: "Returning", next: "silicone2", speed: 100 }); },
    silicone2: () => { kitty.call.go({ one: 1.5 + kitty.state.def.is.clb, two: 1.45, three: 1.5, act: "Step 2", act2: "Returning", next: "silicone3", speed: 100 }); },
    silicone3: () => { kitty.call.go({ one: 1.6 + kitty.state.def.is.clb, two: 1.55, three: 1.6, act: "Step 3", act2: "Returning", next: "silicone4", speed: 100 }); },
    silicone4: () => { kitty.call.go({ one: 1.7 + kitty.state.def.is.clb, two: 1.65, three: 1.7, act: "Step 4", act2: "Returning", next: "silicone5", speed: 100 }); },
    silicone5: () => { kitty.call.go({ one: 2 + kitty.state.def.is.clb, two: 0.01, three: 0.65, act: "step5", act2: "Returning", next: "silicone6", speed: 100 }); },
    silicone6: () => { kitty.call.go({ one: 1 + kitty.state.def.is.clb, two: 0.01, three: 0.70 + kitty.state.def.is.clb, act: "Emptying", act2: "Returning", next: "lock", speed: 100 }); },
    // empty sand
    empty: () => { kitty.call.go({ one: 2 + kitty.state.def.is.clb, two: 0.65, act: "Emptying Sand", next: "empty1" }); },
    empty1: () => { kitty.call.go({ one: 2 + kitty.state.def.is.clb, two: 0.65, act: "Take 2", next: "empty2", speed: 50 }); },
    empty2: () => { kitty.call.go({ one: 2 + kitty.state.def.is.clb, two: 0.65, act: "Take 3", next: "empty3", speed: 50 }); },
    empty3: () => { kitty.call.go({ one: 2, two: 0.70 + kitty.state.def.is.clb, act: "Returning", next: "lock", speed: 100 }); },
    recovery: () => {
      kitty.call.go({ one: 0.45, two: 0.01, three: 0.70 + kitty.state.def.is.clb, act: "recover", next: "lock" });
    },
    lock: function() {
      if (ew.tid.kittyI) clearInterval(ew.tid.kittyI);
      let c = 0.01;
      ew.tid.kittyI = setInterval(() => {
        kitty.call.move(D23, c);
        c = c + 0.01;
        if (0.95 <= c) {
          if (kitty.dbg) console.log("lock pos c:", c);
          clearInterval(ew.tid.kittyI);
          ew.tid.kittyI = 0;
          kitty.call.go({ one: 0.70 + kitty.state.def.is.clb, two: 0.18 + kitty.state.def.is.clb, three: 0.45 + kitty.state.def.is.clb, act: "Locking", next: "sleep" });
        }
      }, 50);
    },
    //
    sleep: function() {
      if (ew.tid.kittyT) {
        clearTimeout(ew.tid.kittyT);
        ew.tid.kittyT = 0;
      }
      if (ew.tid.kittyI) {
        clearInterval(ew.tid.kittyI);
        ew.tid.kittyI = 0;
      }
      ew.oled.msg("Going to Sleep");
      D22.reset(); //stop PWM module
      digitalPulse(D23, 1, [500, 100, 500, 100]);
      if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("going to sleep"), notify: true } } });
      ew.tid.kittyT = setTimeout(() => {
        ew.tid.kittyT = 0;
        if (3 <= ew.is.ondcVoltage() && ew.is.ondcVoltage() <= 4.4) {
          if (kitty.dbg) console.log("sleep ok");
          kitty.state.is.sys.pwr = 0;
          //poke32(0x50000700 + 22 * 4, 2);
          //poke32(0x50000700 + 23 * 4, 2);
          if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("sleeping"), notify: true } } });
          ew.tid.kittyT = setTimeout(() => {
            ew.tid.kittyT = 0;
            if (kitty.dbg) console.log("sleep done, bye");
            if (kitty.state.def.auto.clean) acc.wake(1);
            if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("acc wake"), notify: true } } });
            if (kitty.state.is.auto.uvc) {
              if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("uvc scheduled"), notify: true } } });
              kitty.state.is.auto.uvc = 0;
              ew.tid.kittyT = setTimeout(() => {
                ew.tid.kittyT = 0;
                kitty.call.wake("sand", "uvc");
              }, 180000);
            }
            kitty.state.is.sys.busy = 0;
          }, 1500);
        }
        else {
          ew.oled.msg("Sleep failed");
          if (kitty.dbg) console.log("sleep failed, retry");
          if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("no sleep"), notify: true } } });
          ew.tid.kittyT = setTimeout(() => {
            ew.tid.kittyT = 0;
            kitty.action.sleep();
          }, 2500);
        }
      }, 2000);
    }
  }
};

//events

//BT service
NRF.setServices({
  0xffa0: {
    0xffa1: {
      value: [0x01],
      maxLen: 20,
      writable: true,
      onWrite: function(evt) {
        ew.emit("BTRXcmd", E.toString(evt.data));
      },
      readable: true,
      notify: true,
      description: "status"
    },
    0xffa2: {
      value: [0x01],
      maxLen: 20,
      writable: true,
      onWrite: function(evt) {
        ew.emit("BTRX", E.toString(evt.data));
      },
      readable: true,
      notify: true,
      description: "position"
    }
  }
}, { advertise: ['0xffa0'], uart: true });

//BT
ew.on("BTRXcmd", (i) => {

  if (!kitty.state.is.nrf) {
    kitty.state.is.nrf = 1;
    if (ew.tid.nrf) clearInterval(ew.tid.nrf);
    ew.tid.nrf = setInterval(function() {
      kitty.state.print();
    }, 1000);
  }

  if (i.startsWith(1)) {
    if (i == 11) ew.emit('button', 'short');
    else if (i == 12) ew.emit('button', 'long');
    else if (i == 13) ew.emit('button', 'triple');
    //else if (i == 14) kitty.state.print();
    else if (i.startsWith(16)) setTime(Number(i.split("=")[1] / 1000));
    else if (i.startsWith(17)) {
      kitty.state.def.is.tz = i.split("=")[1];
      E.setTimeZone(kitty.state.def.is.tz);
    }
    else if (i == 18) kitty.state.is.sys.abort = 1;
    else if (i == 19) kitty.state.update();
  }
  else if (i.startsWith(3)) kitty.state.def.sandType[kitty.state.def.is.sand].speed = (19 - (i - 30)) / 10;
  else if (i.startsWith(4)) kitty.state.def.is.sand = i - 40;
  else if (i.startsWith(5)) kitty.state.def.auto.uvc = i - 50;
  else if (i.startsWith(6)) kitty.state.def.auto.delay = i - 60;
  else if (i.startsWith(7)) kitty.state.def.auto.clean = i - 70;
  else if (i.startsWith(8)) kitty.state.is.sys.pause = i - 80;
});

NRF.on('disconnect', function() {
  if (ew.tid.nrf) {
    clearInterval(ew.tid.nrf);
    ew.tid.nrf = 0;
  }
  kitty.state.is.nrf = 0;
});

// button
ew.on("button", (x) => {
  if (kitty.state.is.sys.busy) {
    if (x == "long") {
      ew.oled.msg(kitty.state.is.sys.pause ? "Resume" : "Pause", 1);
      kitty.state.is.sys.pause = 1 - kitty.state.is.sys.pause;
      return;
    }
    buzzer(300);
    ew.oled.msg("I am busy", 1);
    return;
  }
  if (x == "double") {
    ew.oled.msg(kitty.state.is.sys.run + "-" + ew.is.batt(1) + " %", 1, ew.is.ondcVoltage(4) + "% - " + ew.is.ondcVoltage().toFixed(2) + "V");
  }
  else if (x == "short") {
    ew.oled.msg(4.4 <= ew.is.ondcVoltage() ? "Going to sleep" : "Waiking up");
    4.4 <= ew.is.ondcVoltage() ? kitty.action.sleep() : kitty.call.wake();
  }
  else if (x == "triple") {
    acc.sleep();
    buzzer([80, 80, 100, 80, 100]);
    kitty.call.wake("sand", "empty");
  }
  else if (x == "long") {
    acc.sleep();
    buzzer([80, 80, 100]);
    kitty.call.wake("sand", "clean");
  }
});

//accelerator
acc.on("action", (x, y) => {
  if (BTN.read()) return;
  if (y == 1 || y == 2) {
    if (ew.tid.kittyT) {
      clearTimeout(ew.tid.kittyT);
      ew.tid.kittyT = 0;
    }
    ew.tid.kittyT = setTimeout(() => {
      ew.tid.kittyT = 0;
      kitty.call.wake("count");
    }, 500);
  }
});

//defaults
if (!require('Storage').read("kitty.json")) {
  kitty.state.def = {
    is: {
      sand: 1,
      fail: (ew.def.name == "eL-6f") ? 4.4 : 4.2,
      clb: (ew.def.name == "eL-6f") ? 0 : -0.03,
      tz: 3,
      total: 0,
      voltMon: 1,
    },
    auto: {
      uvc: 1,
      clean: 1,
      delay: 3,
      every: { on: 0, hours: [2, 8, 15, 20] },
      light: { on: 0, dur: 0, time: 0 }
    },
    sandType: {
      1: { name: "betonite", speed: 1 },
      2: { name: "silicone", speed: 1 },
      3: { name: "nonstick", speed: 1 },
      4: { name: "tofu", speed: 1 }
    }
  };
  kitty.state.update();
}
else kitty.state.def = require('Storage').readJSON("kitty.json");

//auto save
cron.on('hour', (x) => {
  if (x == 0) {
    if (kitty.state.is.nrf) NRF.updateServices({ 0xffa0: { 0xffa1: { value: E.toString("auto save"), notify: true } } });
    kitty.state.is.sys.run = 0;
    kitty.state.update();
  }
});
