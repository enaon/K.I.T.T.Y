//nano set handler 
//NRF.findDevices(function(devices) {print(devices);},  {timeout : 3000, active:true,filters: [{namePrefix:'eL-7d'}]  });

ew.updateBT = function() { //run this for settings changes to take effect.
	NRF.setTxPower(ew.def.rfTX);
	NRF.setAddress(`${NRF.getAddress()} random`);
	NRF.setAdvertising({}, { name: "eL-" + ew.def.name+ "-V", manufacturerData: [["OFF","-"+"1"]],connectable: true });
	NRF.setServices({
		0xffa0: {
			0xffa1: {
				value: [0x01],
				maxLen: 20,
				writable: true,
				onWrite: function(evt) {
					//global.lala=evt;
					//paca(E.toString(evt.data))
					ew.emit("BTRX",E.toString(evt.data));
				},
				readable: true,
				notify: true,
				description: "ew"
			}
		}
	}, { advertise: ['0xffa0'], uart: true });
	NRF.restart();
};
ew.updateSettings = function() { require('Storage').write('ew.json', ew.def); };
ew.resetSettings = function() {
	ew.def = {
		name: process.env.SERIAL.substring(15),
		rfTX: +4,
		bri: 2, //Screen brightness 1..7
		cli: 1,
		retry: 10,
		addr: NRF.getAddress(),
		mac: "c2:c5:c3:01:d6:63 public",
		buzz: 1,
		mode:"default"
	};
	ew.updateSettings();
};
ew.fileSend=function(filename) {
  let length=0;
  let d = require("Storage").read(filename, length, 20);
  while (d!=="") {
    console.log(btoa(d));
    //console.log(d);
    length=length+20;
     d = require("Storage").read(filename, length, 20);
  }
};
if (!require('Storage').read("ew.json"))
	ew.resetSettings();
else
	ew.def = require('Storage').readJSON("ew.json");
ew.updateBT();
