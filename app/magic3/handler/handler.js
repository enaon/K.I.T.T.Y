//handler
if (require('Storage').read("ew_UI")) eval(require('Storage').read('ew_UI'));
//if (require('Storage').read("UIM")) eval(require('Storage').read('UIM'));

//if (require('Storage').read("ew_handler_fonts")) eval(require('Storage').read('ew_handler_fonts'));
if (require('Storage').read("ew_handler_notify")) eval(require('Storage').read("ew_handler_notify"));
if (require('Storage').read("ew_handler_face")) eval(require('Storage').read("ew_handler_face"));
//if (require('Storage').read("ew_handler_cron")) eval(require('Storage').read("ew_handler_cron"));
if (require('Storage').read("ew_handler_set")) eval(require('Storage').read("ew_handler_set"));
//if (require('Storage').read("ew_handler_buzz")) eval(require('Storage').read("ew_handler_buzz"));
if (require('Storage').read("ew_handler_conn")) eval(require('Storage').read("ew_handler_conn"));
//if (require('Storage').read("handler_charge")) eval(require('Storage').read("handler_charge"));
if (require('Storage').read("ew_handler_btn")) eval(require('Storage').read("ew_handler_btn"));
var i2c = new I2C();
i2c.setup({ scl: ew.pin.i2c.SCL, sda: ew.pin.i2c.SDA, bitrate: 100000 });
if (require('Storage').read('ew_handler_touch'))  eval(require('Storage').read('ew_handler_touch'));
if (require('Storage').read("ew_handler_acc_SC7A20")) eval(require('Storage').read("ew_handler_acc_SC7A20"));

/*

themeD = {
    btn: { onT: 15, onB: 4, offT: 11, offB: 2 },
    menu: { onT: 15, onB: 4, offT: 15, offB: 2 },
    slide: { onT: 15, onB: 4, offT: 15, offB: 2 },
    ntfy: { text: 0, back: 15 },
    clock: { minF: 15, minB: 1, hrF: 11, hrB: 1, secF: 15, secB: 1, dateF: 11, dateB: 0, batF: 11, batB: 0, back: 0, top: 0 }
};
themeN = {
    btn: { onT: 15, onB: 4, offT: 11, offB: 2 },
    menu: { onT: 15, onB: 4, offT: 15, offB: 2 },
    slide: { onT: 15, onB: 4, offT: 15, offB: 2 },
    ntfy: { text: 0, back: 15 },
    clock: { minF: 0, minB: 15, hrF: 10, hrB: 15, secF: 10, secB: 15, dateF: 11, dateB: 0, batF: 11, batB: 0, back: 0, top: 0 }
};
theme = themeD;


//theme
//if (require('Storage').read("handlerTheme")) eval(require('Storage').read("handlerTheme"));
*/




