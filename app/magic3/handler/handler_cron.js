//tasks
ew.sys.cron={
	event:{
		//date:()=>{ setTimeout(() =>{ ew.sys.cron.emit('dateChange',Date().getDate());ew.sys.cron.event.date();},(Date(Date().getFullYear(),Date().getMonth(),Date().getDate()+1)-Date()));},
		hour:()=>{setTimeout(() =>{ ew.sys.cron.emit('hour',Date().getHours());ew.sys.cron.event.hour();},(Date(Date().getFullYear(),Date().getMonth(),Date().getDate(),Date().getHours()+1,0,1)-Date()));},
		//min: ()=>{setTimeout(() =>{ ew.sys.cron.emit('min',Date().getMinutes());ew.sys.cron.event.min();},(Date(Date().getFullYear(),Date().getMonth(),Date().getDate(),Date().getHours(),Date().getMinutes()+1)-Date()));},
		//sec:()=>{setTimeout(() =>{ ew.sys.cron.emit('sec',Date().getSeconds());ew.sys.cron.event.sec();},(Date(Date().getFullYear(),Date().getMonth(),Date().getDate(),Date().getHours(),Date().getMinutes(),Date().getSeconds()+1)-Date()));},
	},
	task:{

	}
};


ew.sys.cron.event.hour();
