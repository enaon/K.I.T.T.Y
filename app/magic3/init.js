E.setFlags({ pretokenise: 1 });
E.setFlags({onErrorSave:true});
//0x20000000+0x10000-process.memory().stackEndAddress

global.save = function() { throw new Error("You don't need to use save() on eucWatch!"); };

// ---- ew object ----

global.ew = { "sys":{}, "apps":{}, "dbg": 0, "face":{}, "logger": {},"notify":{}, "log": [], "def": {}, "is": {}, "do": { "reset": {}, "update": {} }, "tid": {}, "temp": {}, "pin": {} };

if (process.env.BOARD == "MAGIC3" || process.env.BOARD == "Magic3" || process.env.BOARD == "ROCK") {
  ew.pin = { BAT: D30, CHRG: D8, BUZZ: D6, BUZ0: 0, BL: D12, i2c: { SCL: D14, SDA: D15 }, touch: { RST: D39, INT: D32 }, disp: { CS: D3, DC: D47, RST: D2, BL: D12 }, acc: { INT: D16 } };
  E.showMessage = print; //apploader suport
  D7.write(1); // turns off sp02 red led
  ew.do.maxTx = 8;
}

else if (process.env.BOARD == "DSD6") {
  ew.pin = { BAT: D3, CHRG: D2, BUZZ: D25, BUZ0: 1, BL: D12, i2c: { SCL: D13, SDA: D14 }, touch: { RST: D13, INT: D28 }, disp: { SPI: D5, MOSI: D6, CS: D29, DC: D28, RST: D04, BL: D14 }, acc: { INT: D8 }, serial: { rx: D22, tx: D23 } };
  E.showMessage = print; //apploader suport
  ew.do.maxTx = 4;
}

else {
  ew.pin = { BAT: D31, CHRG: D19, BUZZ: D16, BUZ0: 1, BL: D12, i2c: { SCL: D7, SDA: D6 }, touch: { RST: D13, INT: D28 }, disp: { CS: D25, DC: D18, RST: D26, BL: D14 }, acc: { INT: D8 } };
  E.showMessage = print; //apploader suport
  ew.do.maxTx = 4;
}

// ---- watchDog ----

E.kickWatchdog();
ew.sys.kickWD = function() {
  "ram";
  if ((typeof(BTN1) == 'undefined') || (!BTN1.read())) E.kickWatchdog();
};
ew.tid.WD = setInterval(ew.sys.kickWD, 2000);
E.enableWatchdog(process.env.BOARD == "DSD6" ? 3 : 10, false);

// === devmode ===

if ((BTN1.read() || require("Storage").read("devmode"))) {
  //if ((BTN1.read() || require("Storage").read("devmode")) && process.env.BOARD != "BANGLEJS2") {
  let mode = (require("Storage").read("devmode"));
  if (mode == "loader") {
    digitalPulse(ew.pin.BUZZ, ew.pin.BUZ0, 80);
  }
  else if (mode == "shutdown") {
    digitalPulse(ew.pin.BUZZ, ew.pin.BUZ0, 300);
    NRF.sleep();
  }
  else {
    require("Storage").write("devmode", "done");
    NRF.setAdvertising({}, { name: "Espruino-devmode", connectable: true });
    digitalPulse(ew.pin.BUZZ, ew.pin.BUZ0, [80,50,80,50,80]);
    print("Welcome!\n*** DevMode ***\nShort press the side button\nto restart in WorkingMode");
  }
  
  setWatch(function() {
    "ram";
    require("Storage").erase("devmode");
    require("Storage").erase("devmode.info");
    NRF.setServices({}, { uart: false });
    NRF.setServices({}, { uart: true });
    NRF.disconnect();
    NRF.wake();
    setTimeout(() => {
      reset();
    }, 500);
  }, BTN1, { repeat: false, edge: "rising" });

}

// === working mode ===

else { 
  
  // ---- screen driver  ----
  if (require('Storage').read('ew_display')) global.g=require('ew_display').g;
  
  // ---- handler ----
  if (require('Storage').read('ew_handler')) eval(require('Storage').read('ew_handler'));
  
  // ---- K.I.T.T.Y ----
  if (require('Storage').read('ew_kitty')) {
    eval(require('Storage').read('ew_kitty'));
    if (require('Storage').read('ew_ToF')) eval(require('Storage').read('ew_ToF'));
    if (require('Storage').read('ew_scale')) eval(require('Storage').read('ew_scale'));
    if (require('Storage').read('ew_logger_kitty')) {
      ew.logger.kitty=require("ew_logger_kitty");
      ew.sys.cron.on('hour', function(x){ if (x == 0) ew.logger.kitty.saveStats("day"); });
    }
    if (require('Storage').read('ew_logger_battery')) {
      ew.logger.battery=require("ew_logger_battery");
       ew.sys.cron.on('hour', function(x){
        ew.logger.battery.log();
        if (x === 0) ew.logger.battery.saveStats();
      });
    }
  }
  
  // ---- start ----
  digitalPulse(ew.pin.BUZZ, ew.pin.BUZ0, [100, 30, 100]);
  setTimeout(function() {
      ew.face.go('main', 0);
      setTimeout(function() { 
        ew.do.update.acc(); }, 1000);
        digitalPulse(ew.pin.BUZZ, ew.pin.BUZ0, 100);
  },400);
}
