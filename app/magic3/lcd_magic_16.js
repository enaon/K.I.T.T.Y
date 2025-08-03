// MIT License (c) 2020 fanoush https://github.com/fanoush
// see full license text at https://choosealicense.com/licenses/mit/

// *** Magic3-Rock screen driver ***
// *** compiled with options LCD_BPP=16,SHARED_SPIFLASH ***


ew.is.dddm = 16;


if (process.env.BOARD=="MAGIC3") D7.write(1); // turns off HR red led + power up i2c chips
//MAGIC3/Rock/QY03 LCD pins
const CS=D3;
const DC=D47;
const RST=D2;
const BL=D12;
const SCK=D45;
const MOSI=D44;
RST.reset();
SCK.write(0);MOSI.write(0);CS.write(1);DC.write(1);

function toFlatString(arr,retries){
  return (E.toFlatString||E.toString)(arr) || (function(){
    if (retries==0) return undefined;
    E.kickWatchdog();E.defrag();print("toFlatString() fail&retry!");
    return toFlatString(arr,retries?retries-1:2); // 3 retries
  })();
}
function toFlatBuffer(a){return E.toArrayBuffer(toFlatString(a));}  
  
var SPI2 = (function(){
  var bin=toFlatString(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAFKgAAAAAFKwAAAAABLAAA////////////////ELUDTHxEIoBggKGA44AQvcj///8HS3tEG4lDsQRKE2gAK/zQACMTYANKekQTgXBHGPECQLb///+i////OLUjS3tE2mgAKjDQGUoHJBRgGUwBJSVgG2kURguxF0oTYP/32f8WSwAiGmCj9YRjGmAUShBgUWCi8jRSASERYBpoACr80AAiGmASS3tEG2kLsQ1KE2AQS3tEG2kLsQpKE2AKSwAgASIgYBpgOL1P8P8w++cA9QJAcPUCQAwFAFA49QJARPUCQAgFAFAE8AJAjP///0T///84////E7UAKB7bACmmv434BRACJAEkACqkvwKpCRmN+AQApL8BNAH4BCwAK6K/AqoSGQE0IUYBqKi/AvgEPP/3k/8gRgKwEL0AJPrncLUFRoixRhgAJChGEPgBGxmxRRi1QgLZZEIgRnC9//d9/wAo+dEBNO/nBEb15wAAAPT/cBC0AjFEuglIAfT/cXhEATlJulK6W7rEggGDgoPDgw8hFDBd+ARL//fRvwC/bP7//xJLG2gQteu5EUsbaAuxEUoTYBNLEEp7RAAGXGoUYJxqVGDcapRgT/D/NNRg2mgLS0kAGmAAIlpgQ/hIDEP4GBwBIBC9T/D/MPvnAL8A9QJABPMCQAjzAkAI9QJAbPUCQDL+//8HSgAjE2Ci9X5yE2AFSwEiGmAD9UBzG2gLsQNKE2BwRwD1AkAE8AJACPMCQBC1BUx8RMTpCQEBIQH6AvLE6QMyEL0Av7T9//8t6fBPt7DN6QESakp6RJL4AJAAKADwuoAAKQDwt4AJ8f8zBysA8rKAASMD+gnzATvbsgOTAXhDeJeIQeoDIQKbGUFUSwAkHGBTTAcjI2ATaQWUAPECC4myC7FQShNgT+pJA9uyT/AACASTREYerlJLAp17RLP4AqADmwGaC0BB+gnxMvgTwAObC0BB+gnxMvgTIASbHUTtsgctZ9iJsk/qLBMzVRMSBPECDkPqDBwzGQM0qvECCl8sg/gBwB/6ivoG+A4gGN3/943+NUoAIxNgovWEYhNgwvgsZML4MEQxTAEiImA1THxEsusICCKBB78erkRGHEYGrrrxAA+80TBLe0QBP9uIGES/skN4AXhB6gMhApsZQQDxAguJsgAvptEALDDQ//de/h1LH0ofYKP1hGOi8jRSH2DC+DRlwvg4RQEhEWAaaAAq/NAAIhpgHUt7RBtpC7EVShNgBZsAIBhgE0sBIhpgN7C96PCP3kYIPR74ATvtssXxCAsD+gvzGUOJsvNGi+f/9y3+4OdP8P8w6ecAv3D1AkAA9QJADAUAUDj1AkAQ8AJARPUCQAgFAFAE8AJAkP3//yr9//+2/P//nPz//0z8//8="));
  return {
    cmd:E.nativeCall(109, "int(int,int)", bin),
    cmds:E.nativeCall(337, "int(int,int)", bin),
    cmd4:E.nativeCall(265, "int(int,int,int,int)", bin),
    setpins:E.nativeCall(581, "void(int,int,int,int)", bin),
    setwin:E.nativeCall(385, "void(int,int,int,int)", bin),
    enable:E.nativeCall(437, "int(int,int)", bin),
    disable:E.nativeCall(537, "void()", bin),
    blit_setup:E.nativeCall(49, "void(int,int,int,int)", bin),
    blt_pal:E.nativeCall(609, "int(int,int,int)", bin),
  };
})();

E.kickWatchdog();

SPI2.setpins(SCK,MOSI,CS,DC);
SPI2.enable(0x14,0); //32MBit, mode 0

function delayms(ms){ // for short delays, blocks everything
  digitalPulse(DC,0,ms);// use some harmless pin (LCD DC)
  digitalPulse(DC,0,0); // 0ms just waits for previous call
}

function cmd(a){
  var l=a.length;
  if (!l)return SPI2.cmd4(a,-1,-1,-1);
  if (l==2)return SPI2.cmd4(a[0],a[1],-1,-1);
  if (l==3)return SPI2.cmd4(a[0],a[1],a[2],-1);
  if (l==4)return SPI2.cmd4(a[0],a[1],a[2],a[3]);
  if (l==1)return SPI2.cmd4(a[0],-1,-1,-1);
  var b=toFlatString(a);
  SPI2.cmd(E.getAddressOf(b,true),b.length);
}

function cmds(arr){
  var b=toFlatString(arr);
  var c=SPI2.cmds(E.getAddressOf(b,true),b.length);
  if (c<0)print('lcd_cmds: buffer mismatch, cnt='+c);
  return c;
}

RST.set(); // release LCD from reset

function init(bppi) {
  cmd(0x11); // sleep out
  delayms(120);
  cmd([0x36, 0]);     // MADCTL - This is an unrotated screen
  cmd([0x3A, 0x03]);  // COLMOD - interface pixel format - 03 - 12bpp, 05 - 16bpp
  cmd([0xB2, 0xb, 0xb, 0x33, 0x00, 0x33]); // PORCTRL (B2h): Porch Setting
  cmd([0xB7, 0x11]);     // GCTRL (B7h): Gate Control
  cmd([0xBB, 0x35]);  // VCOMS (BBh): VCOM Setting 
  cmd([0xC0, 0x2c]);
  cmd([0xC2, 1]);     // VDVVRHEN (C2h): VDV and VRH Command Enable
  cmd([0xC3, 8]);  // VRHS (C3h): VRH Set 
  cmd([0xC4, 0x20]);  // VDVS (C4h): VDV Set
  cmd([0xC6, 0x1F]);   // VCMOFSET (C5h): VCOM Offset Set .
  cmd([0xD0, 0xA4, 0xA1]);   // PWCTRL1 (D0h): Power Control 1 
  cmd([0xe0, 0xF0, 0x4, 0xa, 0xa, 0x8, 0x25, 0x33, 0x27, 0x3d, 0x38, 0x14, 0x14, 0x25, 0x2a]);   // PVGAMCTRL (E0h): Positive Voltage Gamma Control
  cmd(0x21); // INVON (21h): Display Inversion On
  cmd(0x13);//TFT_NORON: Set Normal display on, no args, w/delay: 10 ms delay
  cmd(0x29);

  }

  var bpp = (require("Storage").read("ew.json") && require("Storage").readJSON("ew.json").sys.bpp) ? require("Storage").readJSON("ew.json").sys.bpp : 1;
  //var bpp=4;
  var g = Graphics.createArrayBuffer(240, 280, bpp,{msb:false});
  var pal;
  //const color=Uint16Array([ 0x000,1365,2730,3549,1629,83,72,0xff0,143,3935,2220,0x5ff,115,3840,1535,4095 ]);
  const color=Uint16Array([ 0x000,1365,2730,3549, 1629 ,3840,72,0xff0,143,3935,2220,0x5ff,3840,3840,1535,4095 ]);

  switch (bpp) {
    case 1:
       pal = Uint16Array([0x000, 4095]);
      g.setCol = function(c, v) {
        if (c == 1) pal[1] = color[v];
        else pal[0] = color[v];
        g.setColor(c);
      };
      break;
    case 2:
      pal = Uint16Array([0x000, 1365, 1629, 1535]); // white won't fit
      g.buffer = new ArrayBuffer(16800);
      break;
    case 4:
      g.buffer = new ArrayBuffer(33600);
      pal=color;
      g.setCol = (c, v) => { g.setColor(v); };
      break;
  }
  
  // preallocate setwindow command buffer for flip
  g.winCmd = toFlatBuffer([
    5, 0x2a, 0, 0, 0, 0,
    5, 0x2b, 0, 0, 0, 0,
    1, 0x2c,
    0
  ]);

  // precompute addresses for flip
  g.winA = E.getAddressOf(g.winCmd, true);
  g.palA = E.getAddressOf(pal.buffer, true); // pallete address
  g.buffA = E.getAddressOf(g.buffer, true); // framebuffer address
  g.stride = g.getWidth() * bpp / 8;

 g.flip = function(force) {
    var r = g.getModified(true);
    if (force)
      r = { x1: 0, y1: 0, x2: this.getWidth() - 1, y2: this.getHeight() - 1 };
    if (r === undefined) return;
    var x1=r.x1&0xfe;var x2=(r.x2+2)&0xfe; // for 12bit mode align to 2 pixels
    //var x1 = r.x1;
    //var x2 = r.x2 + 1; //16bit mode
    var xw = (x2 - x1);
    var yw = (r.y2 - r.y1 + 1);
    if (xw < 1 || yw < 1) { print("empty rect ", xw, yw); return; }
    var c = g.winCmd;
    c[3] = x1;
    c[5] = x2 - 1; //0x2a params
    var y = r.y1 + 20;
    c[9] = y % 256;
    c[8] = y >> 8;
    y = r.y2 + 20;
    c[11] = y % 256;
    c[10] = y >> 8; // 0x2b params
    SPI2.blit_setup(xw, yw, bpp, g.stride);
    var xbits = x1 * bpp;
    var bitoff = xbits % 8;
    var addr = g.buffA + (xbits - bitoff) / 8 + r.y1 * g.stride; // address of upper left corner
    //VIB.set();//debug
    SPI2.cmds(g.winA, c.length);
    SPI2.blt_pal(addr, g.palA, bitoff);
    //VIB.reset();//debug
  };
  
  g.isOn = false;

  g.on = function() {
    //"ram";
    if (this.isOn) return;
    this.isOn = true;
    cmd(0x11);
    delayms(10);
    this.bri.set(this.bri.lv);   
  };
  
  g.off = function() {
    //"ram";
    if (!this.isOn) return;
    //cmd(0x28);
    cmd(0x10);
    BL.reset();
    this.isOn = false;
  };

  g.bri = {
    lv: (require("Storage").readJSON("ew.json", 1) && require("Storage").readJSON("ew.json", 1).sys) ? require("Storage").readJSON("ew.json", 1).sys.bri : 3,
    set: function(o) {
      if (o) this.lv = o;
      else { this.lv++; if (this.lv > 7) this.lv = 1;
        o = this.lv; }
      if (this.lv == 0 || this.lv == 7)
        digitalWrite(BL, (this.lv == 0) ? 0 : 1);
      else
        analogWrite(BL, (this.lv * 42.666) / 256, { freq: 60 });
      ew.def.bri = o;
      return o;
    }
  };
  
  exports = {
    g: g
  };
  
init();