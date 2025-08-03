//dsd6 charge handler 
//charging notify
ew.is.chargeTick=0;
ew.is.ondc=0;
ew.tid.charge = setWatch(function(s) {
	ew.is.ondc = s.state;
	ew.emit('ondc', s);
}, ew.pin.CHRG, { repeat: true, debounce: 50, edge: 0 });
//    let hexString = ("0x" + (0x50000700 + (ew.pin.BAT * 4)).toString(16));
//    poke32(hexString, 2); // disconnect pin for power saving, otherwise it draws 70uA more 
    
