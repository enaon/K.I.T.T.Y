ew.do.update.bluetooth = function() {
	try {
		NRF.setAddress(`${NRF.getAddress()} random`);
		if (ew.def.cli) {

			/*
			NRF.setServices({
				0xffa0: {
					0xffa1: {
						value: [0x01],
						maxLen: 20,
						writable: true,
						onWrite: function(evt) {
							ew.sys.emit("BLE_RX", E.toString(evt.data));
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
							ew.sys.emit("BTRX", E.toString(evt.data));
						},
						readable: true,
						notify: true,
						description: "position"
					}
				}
			}, { advertise: ['0xffa0'], uart: true });
			*/		


			NRF.setAdvertising({}, { name: "eL-" + ew.def.name, connectable: true });
			if (ew.is.btsl == 1) {
				NRF.wake();
				ew.is.btsl = 0;
				if (!ew.def.info) ew.notify.alert("info", { "src": "BT", "title": "BT", "body": "WAKE" }, 1);
			}
		}
		else if (!ew.def.cli) { //if (ew.is.bt) NRF.disconnect();
			NRF.sleep();
			ew.is.btsl = 1;
			if (!ew.def.info) ew.notify.alert("info", { "src": "BT", "title": "BT", "body": "SLEEP" }, 1);

		}

	}
	catch (e) {
		ew.notify.alert("info", { "src": "BT", "title": "SYS", "body": e }, 1);
	}
};

ew.sys.BLEcon = () => {
		ew.is.bt=1;
		ew.notify.alert("info",{"src":"BT","title":"BT","body":"CLIENT IN"},1);
		E.setConsole(Bluetooth,{force:true});
		ew.sys.emit('BLE_con');
}
//
ew.sys.BLEdis = () => {
	if (ew.is.bt==1 && ew.def.info) ew.notify.alert("info",{"src":"BT","title":"BT","body":"CLIENT OUT"},1);
	E.setConsole(null,{force:true});
	ew.is.bt=0; 
    if (!ew.def.cli){
		//NRF.sleep();
		ew.is.btsl=1; 
    }
    ew.sys.emit('BLE_dis');

}
NRF.setTxPower(ew.def.rfTX);
NRF.on('disconnect',ew.sys.BLEdis);  
NRF.on('connect',ew.sys.BLEcon);
ew.do.update.bluetooth();

//ble_uart module
Modules.addCached("bleuart",function(){exports.connect=function(r){var k,l,m,n,f,h={write:function(a){return new Promise(function b(g,e){a.length?(n.writeValue(a.substr(0,20)).then(function(){b(g,e)}).catch(e),a=a.substr(20)):g()})},disconnect:function(){return k.disconnect()},eval:function(a){return new Promise(function(c,g){function e(){var d=b.indexOf("\n");if(0<=d){clearTimeout(p);f=p=void 0;var q=b.substr(0,d);try{c(JSON.parse(q))}catch(t){g(q)}b.length>d+1&&h.emit("data",b.substr(d+1))}}var b="";var p=setTimeout(e,
5E3);f=function(d){b+=d;0<=b.indexOf("\n")&&e()};h.write("\x03\x10Bluetooth.write(JSON.stringify("+a+")+'\\n')\n").then(function(){})})}};return r.gatt.connect().then(function(a){k=a;return k.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e")}).then(function(a){l=a;return l.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e")}).then(function(a){n=a;return l.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e")}).then(function(a){m=a;m.on("characteristicvaluechanged",function(c){c=
E.toString(c.target.value.buffer);f?f(c):h.emit("data",c)});return m.startNotifications()}).then(function(){return h})}
});




