//watchdog
BTN1=D39;
pinMode(D39,"input_pullup");
pinMode(D38,"opendrain_pullup");
E.kickWatchdog();
function kickWd(){
  if(BTN1.read()) E.kickWatchdog();
}
var wdint=setInterval(kickWd,2000);
E.enableWatchdog(6, false);
global.ew = { "dbg": 0, "log": [], "def": {}, "is": {}, "do": {"maxTx": 4, "reset": {}, "update": {} }, "tid": {}, "temp": {}, "pin": {} };
ew.pin = { BUZZ: D38, i2c: { SCL: D9, SDA: D10 }, serial: {rx: D22, tx:D23 } } ;
E.showMessage = print; //apploader suport
global.save = function() { throw new Error("You don't need to use save() on nano!"); };
D13.reset(); //disable VCC output
//NRF.setConnectionInterval(50); 
//
//errata 108 fix // poke32(0x40000EE4,0x4f)
buzzer = digitalPulse.bind(null,ew.pin.BUZZ,0);
//load in devmode
if (!BTN1.read() || require("Storage").read("devmode")) { 
	let mode=(require("Storage").read("devmode"));
	if ( mode=="off"){ 
		require("Storage").write("devmode","done");
		NRF.setAdvertising({},{connectable:false});
		NRF.disconnect();
		NRF.sleep();
		buzzer(250);
	} else {
		require("Storage").write("devmode","done");
		NRF.setAdvertising({}, { name:"eL-"+process.env.SERIAL.substring(15)+"-dev",connectable:true });
		
		NRF.setServices({
			0xffa0: {
				0xffa1: {
					value : [0x00],
					maxLen : 20,
					writable:true,
					onWrite : function(evt) {
						print(1);
						//set.emit("btIn",evt);
					},
					readable:true,
					notify:true,
				   description:"Key Press State"
				}
			}
		}, {advertise: ['0xffa0'],uart:true});
		buzzer(100);
		print("Welcome!\n*** DevMode ***\nShort press the button\nto restart in WorkingMode");
		if (global.o) {
			setTimeout(()=>{
				o.gfx.setFont8x16();
				o.gfx.clear();
				o.gfx.drawString("DEV mode",20,12);
				o.flip();
			},200);
		}else 	global.gotosleep=setTimeout(()=>{NRF.sleep();},300000);
	}
	setWatch(function(){
		require("Storage").erase("devmode");
		NRF.setServices({},{uart:false});
		NRF.setServices({},{uart:true}); 
		NRF.disconnect();
		setTimeout(() => {
			reset();
		}, 500);
	},BTN1,{repeat:false, edge:-1}); 
}else{ //load in working mode

	if (require('Storage').read('handler')) eval(require('Storage').read('handler')); //call handler
	if (require('Storage').read('vibrator')) eval(require('Storage').read('vibrator')); //call vibrator
	print("Welcome!\n*** WorkingMode ***\nLong hold the button\nto restart in DevMode");
}



