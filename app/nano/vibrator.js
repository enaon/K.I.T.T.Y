E.setConsole(Bluetooth, { force: true });

powerbank = {
    tid: 0,
    batt: { dsd6: 0, pwrbank: 0, dsd6V: 0, pwrbankV: 0 },
    state: 0, 
    pin: D38,
    cleartid: () => {
        if (ew.tid.powerbank) {
            clearTimeout(ew.tid.powerbank);
        }
        ew.tid.powerbank = 0;
    },
    toggle: (x) => {
        if (powerbank.tid) { clearTimeout(powerbank.tid);
            powerbank.tid = 0; }
        //buzzer(100);
        powerbank.state ? powerbank.pin.set():powerbank.pin.reset();
        powerbank.state = 1 - powerbank.state;

    },
    turnOn: (x) => {
        if (powerbank.tid) { clearTimeout(powerbank.tid);
            powerbank.tid = 0; }
        //buzzer(100);
        //powerbank.pin.reset()
        powerbank.pulse(1,10)
        //analogWrite(powerbank.pin,0.3)
        powerbank.state = 1;
    },
    turnOff: (x) => {
        if (powerbank.tid) { clearTimeout(powerbank.tid);
            powerbank.tid = 0; }
               //buzzer(100);
        powerbank.pin.set()
        powerbank.state = 0;
    },
    pulse: (x, t) => {
        //digitalPulse(powerbank.pin, 0, [50,130,80,200,50,130,80])
        digitalPulse(powerbank.pin, 0, [150,250,300])
  
      if (powerbank.tid) { clearTimeout(powerbank.tid); powerbank.tid = 0; }
        if (t) powerbank.tid = setTimeout(() => {
            powerbank.tid = 0
            t--;
            if (1<t) powerbank.pulse(x, t);
        }, 1000);
    }
};
ew.on("button", (x) => {
    if (x == "double")
        powerbank.toggle(1);
    else
    if (x == "short")
        powerbank.pulse(1,5);
    else
    if (x == "triple") {
        buzzer([120]);
    }
    else
    if (x == "long") {
        buzzer([80]);
    }
});


