E.setFlags({pretokenise:1});
//touch
ew.UI.nav.next.replaceWith(()=>{ew.sys.buzz.nav(ew.sys.buzz.type.ok);eval(require("Storage").read("ew_f_set_set"));if (ew.UI.ntid) {clearTimeout(ew.UI.ntid);ew.UI.ntid=0;}ew.face[0].bar();});
ew.UI.nav.back.replaceWith(()=>{ew.sys.buzz.nav(ew.sys.buzz.type.ok);eval(require("Storage").read("ew_f_set_set"));if (ew.UI.ntid) {clearTimeout(ew.UI.ntid);ew.UI.ntid=0;}ew.face[0].bar();});
//
ew.face[0].page="theme";
//
let tout=(ew.def.off[ew.face.appRoot[0]])?ew.def.off[ew.face.appRoot[0]]:3000;
let tm=(tout/(tout<60000?"1000":tout<3600000?"60000":"3600000"))+ (tout<60000?"''":tout<3600000?"'":"h");
ew.UI.ele.ind(0,0,0);
ew.UI.c.start(1,0);
ew.UI.btn.img("main","_fold",1,"themes","FACE",11,6,1);
ew.UI.btn.c2l("main","_2x3",3,ew.def.txt?"OFF":tm,ew.def.txt?tm:"",15,6);
ew.UI.btn.c2l("main","_2x3",4,"SIZE",ew.UI.size.txt*100,15,6); //4
ew.UI.btn.img("main","_2x3",5,"txt","TXT",ew.def.txt?15:3,ew.def.txt?4:1);
ew.UI.btn.img("main","_2x3",6,"info","INFO",ew.def.info?15:3,ew.def.info?4:1);
ew.UI.c.end();
ew.UI.c.main._fold=()=>{
	ew.sys.buzz.nav(ew.sys.buzz.type.na);
};
ew.UI.c.main._2x3=(i)=>{
	//"jit";
	if (i==3){
		ew.sys.buzz.nav(ew.sys.buzz.type.ok);
		let f=16<ew.face.appRoot[0].length?ew.face.appRoot[0].substr(0,16).toUpperCase()+"..":ew.face.appRoot[0].toUpperCase();
		ew.UI.btn.ntfy(1,3,0,"_bar",6,"TIMEOUT",f,15,6,1);
		ew.temp.bar=1;
		ew.sys.TC.val={cur:3,dn:3,up:100,tmp:0};
		ew.UI.c.tcBar=(a,b)=>{ 
			ew.UI.btn.ntfy(0,2,1);
			let tout=ew.def.off[ew.face.appRoot[0]]?ew.def.off[ew.face.appRoot[0]]:3000;
			if (a==-1){
				if ( 1000 < tout && tout <= 15000 ) tout=tout<6000?3000:tout-3000;
				else if ( 15000 < tout && tout <= 60000 ) tout=tout-5000;
				else if (60000 < tout && tout <= 3600000 )tout=tout < 600001?60000:tout-600000; 
				else if (3600000 < tout ) tout=tout < 3600000?3600000:tout-1800000; 
				else tout=3000;
				let tm=(tout/(tout<60000?"1000":tout<3600000?"60000":"3600000"))+ (tout<60000?"''":tout<3600000?"'":"h");
				ew.UI.btn.ntfy(0,3,1,"_bar",6,"","",15,0,1);
				ew.UI.btn.c2l("main","_2x3",3,ew.def.txt?"OFF":tm,ew.def.txt?tm:"",15,6);
				ew.def.off[ew.face.appRoot[0]]=tout;
			}else {
				if (1000 <= tout && tout < 15000 )	tout=tout+3000;
				else if (15000 <= tout && tout < 60000 )	tout=tout+5000;
				else if (60000 <= tout && tout < 3600000) tout=tout<600000?600000:tout+600000; 
				else if (3600000 <= tout ) tout=14400000<=tout?14400000:tout+1800000; 
				else tout=3000; //1sec
				let tm=(tout/(tout<60000?"1000":tout<3600000?"60000":"3600000"))+ (tout<60000?"''":tout<3600000?"'":"h");
				ew.UI.btn.ntfy(0,3,1,"_bar",6,"","",15,0,1);
				ew.UI.btn.c2l("main","_2x3",3,ew.def.txt?"OFF":tm,ew.def.txt?tm:"",15,6);
				ew.def.off[ew.face.appRoot[0]]=tout;
			}
		};	
	}else if (i==4){
		ew.sys.buzz.nav(ew.sys.buzz.type.ok);
		ew.UI.btn.ntfy(1,3,0,"_bar",6,"TEXT SIZE","SET",15,6,1);
		ew.temp.bar=1;
		ew.sys.TC.val={cur:ew.UI.size.txt*100,dn:60,up:100,tmp:0};
		ew.UI.c.tcBar=(a,b)=>{ 
			ew.UI.btn.ntfy(0,2,1);
			ew.UI.btn.c2l("main","_2x3",4,"SIZE",b,15,6); //4
			ew.UI.size.txt=b/100;
			ew.UI.size.sca=b/100*(process.env.BOARD=="BANGLEJS2"?0.9:1.1);
			ew.def.size=b/100;
		};		
	}else if (i==5){
		ew.sys.buzz.nav(ew.sys.buzz.type.ok);
		ew.def.txt=1-ew.def.txt;
		if (ew.def.info) ew.UI.btn.ntfy(1,0,0,"_bar",6,"TEXT UNDER","ICON",0,15);
		ew.UI.btn.img("main","_2x3",5,"txt","TXT",ew.def.txt?15:3,ew.def.txt?4:1);
		ew.UI.btn.img("main","_2x3",6,"info","INFO",ew.def.info?15:3,ew.def.info?4:1);
		ew.UI.btn.c2l("main","_2x3",3,ew.def.txt?"OFF":tm,ew.def.txt?tm:"",15,6);
	}else if (i==6){
		ew.sys.buzz.nav(ew.sys.buzz.type.ok);
		ew.def.info=1-ew.def.info;
		ew.UI.btn.ntfy(1,0,0,"_bar",6,"INFO ON","ACTIONS",0,15);
		ew.UI.btn.img("main","_2x3",6,"info","INFO",ew.def.info?15:3,ew.def.info?4:1);
	}
};
//
