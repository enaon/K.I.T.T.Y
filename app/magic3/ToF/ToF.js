Modules.addCached("VL_53L0X", function() {
  function c(a, b) { this.options = b || {};
    this.i2c = a;
    this.ad = 41;
    this.options.address && (this.ad = this.options.address >> 1, this.i2c.writeTo(41, 138, this.ad));
    this.init() } c.prototype.init = function() { this.w(128, 1);
    this.w(255, 1);
    this.w(0, 0);
    this.StopVariable = this.r(145, 1)[0];
    this.w(0, 1);
    this.w(255, 0);
    this.w(128, 0) };
  c.prototype.r = function(a, b) { this.i2c.writeTo(this.ad, a); return this.i2c.readFrom(this.ad, b) };
  c.prototype.w = function(a, b) { this.i2c.writeTo(this.ad, a, b) };
  c.prototype.performSingleMeasurement =
    function() { this.w(128, 1);
      this.w(255, 1);
      this.w(0, 0);
      this.w(145, this.StopVariable);
      this.w(0, 1);
      this.w(255, 0);
      this.w(128, 0); for (this.w(0, 1); !this.r(20, 1)[0] & 1;); var a = new DataView(this.r(20, 12).buffer); return { distance: a.getUint16(10), signalRate: a.getUint16(6) / 128, ambientRate: a.getUint16(8) / 128, effectiveSpadRtnCount: a.getUint16(2) / 256 } };
  exports.connect = function(a, b) { return new c(a, b) }
});

//
ew.apps.ToF = {
  i2c: new I2C,
  init: () => {
    ew.apps.ToF.i2c.setup({ sda: ew.pin.i2c.SDA, scl: ew.pin.i2c.SCL });
    ew.apps.ToF.laser = require("VL_53L0X").connect(ew.apps.ToF.i2c);
    //ew.apps.ToF.laser.setDistanceMode("short");
    //ew.apps.ToF.laser.stopContinuous(1000);
  },
  start: () => {
    ew.apps.ToF.init();
    ew.apps.ToF.tid = setInterval(function() {
      console.log(ew.apps.ToF.laser.performSingleMeasurement().distance / 10 + " cm");
    }, 500);
  },
  read: () => {
    ew.apps.ToF.init();
    return ew.apps.ToF.laser.performSingleMeasurement().distance / 10;
  },
  stop: () => {
    if (ew.apps.ToF.tid) clearInterval(ew.apps.ToF.tid);
    ew.apps.ToF.tid = 0;
    poke32(0x50000700 + 14 * 4, 2);
    poke32(0x50000700 + 15 * 4, 2);
  }
};

//ew.apps.ToF.laser.readDistance()
