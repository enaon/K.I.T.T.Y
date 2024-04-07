//Vteran euc module 
E.setFlags({ pretokenise: 1 });
euc.cmd=function(no){
	switch (no) {
		case "beep":return [98]; 
		case "rideSoft":return "SETs"; 
		case "rideMed":return  "SETm"; 
		case "rideStrong":return "SETh";
		case "setLightOn":return "SetLightON";
		case "setLightOff":return "SetLightOFF";
		case "setVolUp":return "SetFctVol+";
		case "setVolDn":return "SetFctVol-";
		case "clearMeter":return "CLEARMETER";
		case "switchPackets": euc.temp.CHANGESTRORPACK=1; return "CHANGESTRORPACK";
		case "changePage": euc.temp.CHANGESTRORPACK++; return "CHANGESHOWPAGE";
		case "returnMain": euc.temp.CHANGESTRORPACK=0;return "CHANGESTRORPACK";
		default: return [];
    }
};
euc.isProxy=0;
//start
euc.wri=function(i) {if (ew.def.cli) console.log("not connected yet"); if (i=="end") euc.off(); return;};
euc.conn=function(mac){
	//check
	if ( euc.gatt!="undefined") {
		if (ew.def.cli) print("ble allready connected"); 
		if (euc.gatt.connected) {euc.gatt.disconnect();return;}
	}
	//check if proxy
	if (mac.includes("private-resolvable")&&!euc.isProxy ){
		let name=require("Storage").readJSON("dash.json",1)["slot"+require("Storage").readJSON("dash.json",1).slot+"Name"];
		NRF.requestDevice({ timeout:2000, filters: [{ namePrefix: name }] }).then(function(device) { euc.isProxy=1;euc.conn(device.id);}  ).catch(function(err) {print ("error "+err);euc.conn(euc.mac); });
		return;
	}
	euc.isProxy=0;
	euc.pac=[]; 
	//connect 
	NRF.connect(mac,{minInterval:7.5, maxInterval:15})
	.then(function(g) {
		euc.gatt=g;
	   return g.getPrimaryService(0xffe0);
	}).then(function(s) {
	  return s.getCharacteristic(0xffe1);
	//read
	}).then(function(c) {
		this.need=0;
		//this.event=new Uint8Array(event.target.value.buffer);
		let ev=new Uint8Array(20);
		c.on('characteristicvaluechanged', function(event) {
			if (euc.is.busy) return;
			if (ew.is.bt==5) 	euc.proxy.w(event.target.value.buffer);
			ev.set(event.target.value.buffer);
			euc.is.alert=0;
			/*if (euc.temp.CHANGESTRORPACK) {
				euc.tot=E.toUint8Array(euc.pac,event.target.value.buffer);
				if ( (event.target.value.buffer[event.target.value.buffer.length - 2]== 85 && event.target.value.buffer[event.target.value.buffer.length - 1]==53) ||(event.target.value.buffer[event.target.value.buffer.length - 2]== 80 && event.target.value.buffer[event.target.value.buffer.length - 1]==55)||(event.target.value.buffer[event.target.value.buffer.length - 2]== 70 && event.target.value.buffer[event.target.value.buffer.length - 1]==99) ) {
					euc.pac=[];
					print(E.toString(euc.tot));
				} else euc.pac=euc.tot;
				return;
			}
			*/
			//print(this.ev);
			if  ( ev[0]===220 && ev[1]===90 && ev[2]===92 ) {
				//volt-bat
				euc.dash.live.volt=(ev[4]  << 8 | ev[5] )/100;
				euc.dash.live.bat=Math.round(100*(euc.dash.live.volt*4.166 - euc.dash.opt.bat.low ) / (euc.dash.opt.bat.hi-euc.dash.opt.bat.low));
				euc.log.batL.unshift(euc.dash.live.bat);
				if (20<euc.log.batL.length) euc.log.batL.pop();
				euc.dash.alrt.bat.cc = (50 <= euc.dash.live.bat)? 0 : (euc.dash.live.bat <= euc.dash.alrt.bat.hapt.low)? 2 : 1;	
				if ( euc.dash.alrt.bat.hapt.en && euc.dash.alrt.bat.cc ==2 )  euc.is.alert ++;   
				//spd
				euc.dash.live.spd=(ev[6] << 8 | ev[7]) / 10;
				if (euc.dash.trip.topS < euc.dash.live.spd) euc.dash.trip.topS = euc.dash.live.spd;
				euc.dash.alrt.spd.cc = ( euc.dash.alrt.spd.hapt.hi <= euc.dash.live.spd )? 2 : ( euc.dash.alrt.spd.hapt.low <= euc.dash.live.spd )? 1 : 0 ;	
				if ( euc.dash.alrt.spd.hapt.en && euc.dash.alrt.spd.cc == 2 ) 
					euc.is.alert = 1 + Math.round((euc.dash.live.spd-euc.dash.alrt.spd.hapt.hi) / euc.dash.alrt.spd.hapt.step) ; 	
				//trip
				euc.dash.trip.last=(ev[10] << 24 | ev[11] << 16 | ev[8] << 8  | ev[9])/1000;
				euc.dash.trip.totl=(ev[14] << 24 | ev[15] << 16 | ev[12] << 8  | ev[13])/1000;
				euc.log.trip.forEach(function(val,pos){ if (!val) euc.log.trip[pos]=euc.dash.trip.totl;});
				//amp
				euc.dash.live.amp=(32766<(ev[16]<<8|ev[17]))?((ev[16]<<8|ev[17])-65535)/100:(ev[16]<<8|ev[17])/100 ;
				if (euc.dash.opt.unit.ampR) euc.dash.live.amp=-euc.dash.live.amp;				
				euc.log.ampL.unshift(euc.dash.live.amp);
				if (20<euc.log.ampL.length) euc.log.ampL.pop();
				euc.dash.alrt.amp.cc = ( euc.dash.alrt.amp.hapt.hi <= euc.dash.live.amp || euc.dash.live.amp <= euc.dash.alrt.amp.hapt.low )? 2 : ( euc.dash.live.amp  <= -0.5 || 15 <= euc.dash.live.amp)? 1 : 0;
				if (euc.dash.alrt.amp.hapt.en && euc.dash.alrt.amp.cc==2) {
					if (euc.dash.alrt.amp.hapt.hi<=euc.dash.live.amp)	euc.is.alert =  euc.is.alert + 1 + Math.round( (euc.dash.live.amp - euc.dash.alrt.amp.hapt.hi) / euc.dash.alrt.amp.hapt.step) ;
					else euc.is.alert =  euc.is.alert + 1 + Math.round(-(euc.dash.live.amp - euc.dash.alrt.amp.hapt.low) / euc.dash.alrt.amp.hapt.step) ;
				}
				//tmp
				euc.dash.live.tmp=(ev[18] << 8 | ev[19])/100;
				euc.dash.alrt.tmp.cc=(euc.dash.alrt.tmp.hapt.hi - 5 <= euc.dash.live.tmp )? (euc.dash.alrt.tmp.hapt.hi <= euc.dash.live.tmp )?2:1:0;
				if (euc.dash.alrt.tmp.hapt.en && euc.dash.alrt.tmp.cc==2) euc.is.alert++;
			} else {
				euc.dash.trip.avrS=((ev[4] << 8 | ev[5]) / 10)|0;
				if (!euc.dash.info.get.modl) euc.dash.info.get.modl=(ev[8] << 8 | ev[9]);
				euc.dash.opt.ride.mode=(ev[10] << 8 | ev[11]);
				euc.dash.live.pwm=event.target.value.getInt16(12)/100;
			}
			//alerts
			if (euc.is.alert && !euc.is.buzz) {  
				if (!w.gfx.isOn&&(euc.dash.alrt.spd.cc||euc.dash.alrt.amp.cc||euc.dash.alrt.pwr)) face.go(ew.is.dash[ew.def.dash.face],0);
				//else face.off(6000);
				euc.is.buzz=1;
				if (20<=euc.is.alert) euc.is.alert=20;
				var a = [100];
				while (5 <= euc.is.alert) {
					a.push(150,500);
					euc.is.alert=euc.is.alert-5;
				}
				for (let i = 0; i < euc.is.alert ; i++) a.push(150,150);
				buzzer.euc(a);  
				setTimeout(() => {euc.is.buzz=0; }, 3000);
			}
		});
		//on disconnect
		euc.gatt.device.on('gattserverdisconnected', euc.off);
		return  c;
	//write
	}).then(function(c) {
		console.log("EUC Veteran connected!!"); 
		euc.wri= function(n,v) {
            //console.log("got :", n);
			if (euc.tout.busy) { clearTimeout(euc.tout.busy);euc.tout.busy=setTimeout(()=>{euc.tout.busy=0;},100);return;} 
			euc.tout.busy=setTimeout(()=>{euc.tout.busy=0;},200);
            //end
			if (n==="proxy") {
				c.writeValue(v).then(function() {
                    if (euc.tout.busy) {clearTimeout(euc.tout.busy);euc.tout.busy=0;}
				}).catch(euc.off);
			}else if (n=="hornOn") {
				euc.is.horn=1;
				let md={"1":"SETs","2":"SETm","3":"SETh"};
				c.writeValue(md[euc.dash.opt.ride.mode]).then(function() { 
					if (!euc.is.busy) {euc.is.busy=1;euc.is.horn=1;c.stopNotifications();}
					setTimeout(() => {
						c.writeValue((euc.dash.opt.lght.HL)?"SetLightOFF":"SetLightON").then(function() {
							setTimeout(() => { 
								c.writeValue((euc.dash.opt.lght.HL)?"SetLightON":"SetLightOFF").then(function() {	
									setTimeout(() => {
										if (BTN1.read()) {
											if (euc.tout.busy) { clearTimeout(euc.tout.busy);euc.tout.busy=0;} 
											euc.wri("hornOn");
										}else {
											euc.is.horn=0;
											euc.is.busy=0;
											c.startNotifications();
										}
									},30); 	
								});
							},30);
						});	
					},60);
				});
			}else if (n=="hornOff") {
				euc.is.horn=0;
			}else if (n=="start") {
				c.startNotifications().then(function() {
					buzzer.nav([100,100,150,]);
					if (euc.dash.auto.onC.HL) return c.writeValue(euc.cmd((euc.dash.auto.onC.HL==1)?"setLightOn":"setLightOff"));
				}).then(function() {
					if (euc.dash.auto.onC.clrM) return c.writeValue(euc.cmd("clearMeter"));
				}).then(function()  {
					if (euc.dash.auto.onC.beep) return c.writeValue(euc.cmd("beep"));
					//if (euc.dash.auto.onC.rstT) {}
					euc.is.run=1;
					return true;
				});
			}else if (euc.state=="OFF"||n=="end") {
				let hld=["none","setLightOn","setLightOff"];
				c.writeValue(euc.cmd(hld[euc.dash.auto.onD.HL])).then(function() {
					if (euc.dash.auto.onD.beep) return c.writeValue(euc.cmd("beep"));
				}).then(function() {
					euc.is.run=0;
					return c.stopNotifications();
				}).then(function() {
					euc.gatt.disconnect(); 
				}).catch(euc.off);
            }else if (euc.cmd(n)) {
				c.writeValue(euc.cmd(n)).then(function() {
					if (euc.tout.busy) {clearTimeout(euc.tout.busy);euc.tout.busy=0;}
				}).catch(euc.off);
			}
		};
		if (!ew.do.fileRead("dash","slot"+ew.do.fileRead("dash","slot")+"Mac")) {
			euc.dash.info.get.mac=euc.mac; euc.dash.opt.bat.hi=420;euc.dash.opt.bat.low=315;
			euc.updateDash(require("Storage").readJSON("dash.json",1).slot);
			ew.do.fileWrite("dash","slot"+ew.do.fileRead("dash","slot")+"Mac",euc.mac);
		}
		euc.state="READY";euc.wri("start");
	//reconect
	}).catch(euc.off);
};

//euc.wri("changePage")
//euc.wri("switchPackets")
//euc.wri("returnMain")