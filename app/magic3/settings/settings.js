//settings

ew.face[0] = {
	run:false,
	btn:{},
	offms: (ew.def.off[ew.face.appCurr])?ew.def.off[ew.face.appCurr]:25000,
	bpp:ew.def.bpp?0:1,
	init: function(o){ 
		ew.face.faceSave=[ew.face.appPrev,ew.face.pagePrev,ew.face.pageArg];
		ew.UI.ele.fill("_main",9,0);
		eval(require('Storage').read(o==1?'ew_f_set_set':o==2?'ew_f_set_apps':'ew_f_set_dash')); 
		//eval(require('Storage').read(o==1?'set_main':o==2?'set_set':ew.face.faceSave[0].substring(0,4)=="dash"?'set_dash':'set_set')); 
		this.bar();
	},
	show : function(s){
		if (!this.run) return;
	},
	bar:function(){
		if (ew.is.UIpri) { ew.notify.alert("error",ew.notify.log.error[0], 1, 1);return;}
		ew.temp.bar=0;
		ew.UI.c.start(0,1);
		this.ref();
		ew.UI.c.end();
		ew.UI.c.bar._bar=(i)=>{
			if (i==1){
				if (this.page=="set1") {ew.sys.buzz.nav(ew.sys.buzz.type.na);return;}
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				eval(require('Storage').read("ew_f_set_set"));
				ew.face[0].ref1(i);

			}else if (i==2){
				if (this.page=="app") {ew.sys.buzz.nav(ew.sys.buzz.type.na);return;}
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				eval(require('Storage').read("ew_f_set_apps"));
				ew.face[0].ref1(i);

			}else if (i==3){
				if (this.page=="dash1") {ew.sys.buzz.nav(ew.sys.buzz.type.na);return;}
				ew.sys.buzz.nav(ew.sys.buzz.type.ok);
				eval(require('Storage').read("ew_f_set_dash"));
				ew.face[0].ref1(i);

				//setTimeout(function(){ ew.face[0].ref();},0);
			}
    };
	},
	ref1 : function(i){
	  //"jit";
		ew.UI.btn.img("bar","_bar",1,"settings",0,i==1?11:2,0);
		ew.UI.btn.img("bar","_bar",2,"watch",0,i==2?11:2,0);
		ew.UI.btn.img("bar","_bar",3,"dash",0,i==3?11:2,0);
	},
	ref : function(s){
	  //"jit";
		ew.UI.btn.img("bar","_bar",1,"settings",0,ew.face[0].page=="set"||ew.face[0].page=="theme"?11:2,0);
		ew.UI.btn.img("bar","_bar",2,"watch",0,ew.face[0].page=="app"?11:2,0);
		ew.UI.btn.img("bar","_bar",3,"dash",0,ew.face[0].page=="dash1"||ew.face[0].page=="dash2"?11:2,0);
	},
	clear : function(o){
		ew.temp.bar=0;/*TC.removeAllListeners();*/if (this.tid) clearTimeout(this.tid);this.tid=0;return true;
	},
	off: function(o){
		g.off();this.clear(o);
	}
};
//



