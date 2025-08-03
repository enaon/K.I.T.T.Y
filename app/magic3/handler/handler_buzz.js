//buzzzer
ew.sys.buzz={};

if (process.env.BOARD == "MAGIC3" || process.env.BOARD == "Magic3" || process.env.BOARD == "ROCK")
ew.sys.buzz.type={na:[15,15,15],ok:15,ln:80,error:[50,25,50,25,50],on:40,off:[20,25,20]}
else
ew.sys.buzz.type={ok:[20,40,20],na:25,ln:80,error:[50,25,50,25,50],on:40,off:[20,25,20]}

//buz={ok:[20,40,20],na:25,ln:80,on:40,off:[20,25,20]};
ew.sys.buzz.sys = digitalPulse.bind(null,ew.pin.BUZZ,ew.pin.BUZ0);
ew.sys.buzz.alrm = digitalPulse.bind(null,ew.pin.BUZZ,ew.pin.BUZ0);
ew.sys.buzz.euc = digitalPulse.bind(null,ew.pin.BUZZ,ew.pin.BUZ0);
if (ew.def.buzz) ew.sys.buzz.nav = digitalPulse.bind(null,ew.pin.BUZZ,ew.pin.BUZ0);
else ew.sys.buzz.nav=function(){return true;};


