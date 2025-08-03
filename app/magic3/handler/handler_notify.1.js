E.setFlags({ pretokenise: 1 });
//notifications
ew.notify = {
	new: 0,
	is: { info: 0, error: 0 },
	log: {},
	do: {}
};
ew.notify.log.info = (require('Storage').read('log_info.log')) ? require('Storage').readJSON('log_info.log') : [];
ew.notify.log.error = (require('Storage').read('log_error.log')) ? require('Storage').readJSON('log_error.log') : [];

//ew.notify.log.call=(require('Storage').read('log_call.log'))?require('Storage').readJSON('log_call.log'):[];
//ew.notify.log.euc=(require('Storage').read('log_euc.log'))?require('Storage').readJSON('log_euc.log'):[];
//notify
ew.notify.alert = function(type, event, alert, persist) {
	this.is[type]++;
	this.new++;
	let d = (Date()).toString().split(' ');
	let ti = ("" + d[4] + " " + d[0] + " " + d[2]);
	// ---- do not log stored notifications ----
	if (!event.time) {
		event.time = ti;
		//this.log[type].unshift("{\"src\":\""+event.src+"\",\"title\":\""+event.title+"\",\"body\":\""+event.body+"\",\"time\":\""+ti+"\"}");
		//this.log[type].unshift({"src":event.src,"title":event.title,"body":event.body,"time":ti});
		this.log[type].unshift(event);
	}
	if (26 <= this.log[type].length) this.log[type].pop();
	if (ew.def.scrn || g.isOn) {
		//ew.face.off(8000);
		if (ew.face[0].bar) {
			if (!g.isOn) ew.face.go("main", 0);
			ew.face.off();
			ew.UI.btn.ntfy(1, persist ? 20 : 4, 0, "_bar", 6, event.title.toUpperCase() || "", event.body.toUpperCase() || "", (type === "error") ? 15 : 0, (type === "error") ? 13 : 15, 0, 0, (type === "error") ? 1 : 0);
			g.flip();
		}
		else if (!discrete) {
			if (ew.face.appCurr != "main" || ew.face.pageCurr != 0) {
				ew.face.go("main", 0);
				ew.face.appPrev = "main";
				ew.face.pagePrev = -1;
			}
		}
		if (alert) {
			if (type === "error")
				ew.sys.buzz.sys(ew.sys.buzz.type.error);
			else ew.sys.buzz.nav([80, 50, 80]);

		}
	}
};
