//dsd6 set handler 
ew.updateBT = function() { //run this for settings changes to take effect.
	NRF.setTxPower(ew.def.rfTX);
	NRF.setAddress(`${NRF.getAddress()} random`);
	NRF.setAdvertising({}, { name: "eL-" + ew.def.name });
	NRF.setServices({
		0xffa0: {
			0xffa1: {
				value: [0x01],
				maxLen: 20,
				writable: true,
				onWrite: function(evt) {
					ew.emit("BTRX", E.toString(evt.data));
				},
				readable: true,
				notify: true,
				description: "ew"
			}
		}
	}, { advertise: ['0xffa0'], uart: true });
	//NRF.disconnect();
	NRF.restart();
};

ew.is.batt=function(i){
		  let v=6.61207596594*analogRead(D3);
		  poke32(0x5000070c,2); // disconnect pin for power saving, otherwise it draws 70uA more
		  if (i) return Math.round( (v*100-350)*(100/( 415-350)));
		  else return Number(v.toFixed(2));
};
ew.is.ondcVoltage=function(i){
		  let v=6.61207596594*analogRead(D2);
		  poke32(0x50000708,2); // disconnect pin for power saving, otherwise it draws 70uA more
		  if (i) return Math.round( (v*100-330)*(100/( 420-330)));
		  else return Number(v.toFixed(2));
};



ew.updateSettings = function() { require('Storage').write('ew.json', ew.def); };
ew.resetSettings = function() {
	ew.def = {
		name: process.env.SERIAL.substring(15),
		rfTX: +4,
		cli: 1,
		addr: NRF.getAddress(),
		buzz: 1,
		mode: "scata"
	};
	ew.updateSettings();
};
ew.fileSend = function(filename) {
	let length = 0;
	let d = require("Storage").read(filename, length, 20);
	while (d !== "") {
		console.log(btoa(d));
		//console.log(d);
		length = length + 20;
		d = require("Storage").read(filename, length, 20);
	}
};

if (!require('Storage').read("ew.json"))
	ew.resetSettings();
else
	ew.def = require('Storage').readJSON("ew.json");
ew.updateBT();

E.setDST(60,120,4,0,2,0,180,4,0,9,0,240); //Greece-Athens- we have a time which is 2 hours ahead of GMT in winter (EET) and 3 hours in summer (EEST)

ew.is.bootTime = getTime();
NRF.setTxPower(4);
