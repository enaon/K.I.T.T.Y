E.setConsole(Bluetooth, { force: true });
pinMode(D22, "opendrain");
pinMode(D23, "opendrain");

ew.on("BTRX", (i) => {
    eval(i);
    ew.oled.msg("yes master");
    // lala=print(i);
    //    lalo=i;
});
ew.updateBT();
NRF.setTxPower(4);


ew.on("ondc", (x) => {
    //ew.oled.msg("hello");

});

powerbank = {
    tid: 0,
    batt: { dsd6: 0, pwrbank: 0, dsd6V: 0, pwrbankV: 0 },
    slot1: { state: 0, xiaomi: 0, pin: "D22", verify: 1 },
    slot2: { state: 0, xiaomi: 0, pin: "D23", verify: 1 },
    cleartid: () => {
        if (ew.tid.powerbank) {
            clearTimeout(ew.tid.powerbank);
        }
        ew.tid.powerbank = 0;
    },
    toggle: (x) => {
        if (powerbank.tid) { clearTimeout(powerbank.tid);
            powerbank.tid = 0; }
        buzzer(100);
        ew.oled.msg(powerbank["slot" + x].state ? "Slot " + x + " OFF" : "Slot " + x + " ON", 1, ew.is.ondcVoltage(4) + "% - " + ew.is.ondcVoltage().toFixed(2) + "V");
        digitalPulse(powerbank["slot" + x].pin, 0, powerbank["slot" + x].state ? powerbank["slot" + x].xiaomi ? [150, 100, 150, 1000, 150, 1000, 150, 100, 150] : [100, 100, 100] : 100);
        powerbank["slot" + x].state = 1 - powerbank["slot" + x].state;

    },
    turnOn: (x) => {
        if (powerbank.tid) { clearTimeout(powerbank.tid);
            powerbank.tid = 0; }
        buzzer(100);
        ew.oled.msg("Slot " + x + " ON", 1, ew.is.ondcVoltage(4) + "% - " + ew.is.ondcVoltage().toFixed(2) + "V");
        digitalPulse(powerbank["slot" + x].pin, 0, 100);
        powerbank["slot" + x].state = 1;
        if (powerbank["slot" + x].verify) {
            powerbank.tid = setTimeout(() => {
                if (!ew.is.charging())
                    powerbank.turnOn(x);
                powerbank.tid = 0;
            }, 1000);
        }
    },
    turnOff: (x) => {
        if (powerbank.tid) { clearTimeout(powerbank.tid);
            powerbank.tid = 0; }
        buzzer(100);
        ew.oled.msg("Slot " + x + " ON", 1, ew.is.ondcVoltage(4) + "% - " + ew.is.ondcVoltage().toFixed(2) + "V");
        digitalPulse(powerbank["slot" + x].pin, 0, powerbank["slot" + x].xiaomi ? [150, 100, 150, 1000, 150, 1000, 150, 100, 150] : [100, 150, 100]);
        powerbank["slot" + x].state = 0;
        if (powerbank["slot" + x].verify) {
            powerbank.tid = setTimeout(() => {
                if (ew.is.charging())
                    powerbank.turnOff(x);
                powerbank.tid = 0;
            }, powerbank["slot" + x].xiaomi ? 5500 : 1500);
        }
    },
    pulse: (x, t) => {
        digitalPulse(powerbank["slot" + x].pin, 0, [100, 500, 100])
        if (powerbank.tid) { clearTimeout(powerbank.tid); powerbank.tid = 0; }
        if (t) powerbank.tid = setTimeout(() => {
            powerbank.tid = 0
            t--;
            digitalPulse(powerbank["slot" + x].pin, 0, [100, 500, 100])
            if (1<t) powerbank.pulse(x, t);
        }, 2000);
    }
};
ew.on("button", (x) => {
    if (x == "double")
        powerbank.toggle(1);
    else
    if (x == "short")
        powerbank.toggle(2);
    else
    if (x == "triple") {
        buzzer([120]);
        ew.oled.msg(acc.state ? "Tap OFF" : "Tap ON");
        if (acc.state) acc.sleep();
        else acc.wake(1);

    }
    else
    if (x == "long") {
        buzzer([80]);
        ew.oled.msg(ew.is.ondcVoltage(4) + "% - " + ew.is.ondcVoltage().toFixed(2) + "V", 1, ew.is.batt(4) + "% - " + ew.is.batt().toFixed(2) + "V");
    }
});

acc.on("action", (x, y) => {
    //print("acc action:", x, y);
    //if (y==1||y==2) (x=="double")?scata.tap=5:scata.tap++;  
    digitalPulse(D22, 0, x == "double" ? powerbank.slot1.xiaomi ? [150, 100, 150, 1000, 150, 1000, 150, 100, 150] : [100, 100, 100] : 100);
    ew.oled.msg(x == "double" ? "Slot 1 OFF" : "Slot 1 ON", 1, ew.is.ondcVoltage(4) + "% - " + ew.is.ondcVoltage().toFixed(2) + "V");
    powerbank.slot1.state = x == "double" ? 0 : 1;



});

ew.tid.powerbank = setTimeout(() => {
    ew.tid.powerbank = 0;
    ew.oled.off();
    //acc.wake(1);
    acc.sleep();
}, 3000);
