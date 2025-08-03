	if (ew.def.touchtype != "816" && ew.def.touchtype != "716") {
		digitalPulse(ew.def.rstP, 1, [5, 500]);
		i2c.writeTo(0x15, 0x80);
		ew.def.touchtype = (i2c.readFrom(0x15, 1)[0] == 96) ? "816" : "716";
	}
	if (ew.def.touchtype == "816") //816
		eval(require('Storage').read('ew_handler_touch_816'));
	else
		eval(require('Storage').read('ew_handler_touch_716'));


/*
ew.sys.TC.on('bar', ew.UI.nav.bar);
ew.sys.TC.on('tc1', ew.UI.nav.tcDn);
ew.sys.TC.on('tc2', ew.UI.nav.tcUp);
ew.sys.TC.on('tc3', ew.UI.nav.tcNext);
ew.sys.TC.on('tc4', ew.UI.nav.tcBack);
ew.sys.TC.on('tc5', ew.UI.c.xy);
ew.sys.TC.on('tc12', ew.UI.c.xy);
*/