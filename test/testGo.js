var then = require("../index");
var _ = require("underscore");


then((next)=>{

	console.log('testGo1 start');
	next();

}).go((next)=>{

	setTimeout(()=>{
		console.log('1func 100ms');
		next();
	},100);

}).go((next)=>{

	setTimeout(()=>{
		console.log('2func 200ms');
		next();
	},200);
	
}).go((next)=>{
	setTimeout(()=>{
		console.log('3func 300ms');
		next();
	},300);
}).then((next)=>{
	setTimeout(()=>{
		console.log('then1');
		next();
	},0);
	next();
}).then((next)=>{
	setTimeout(()=>{
		console.log('then2');
	},0);
	next();
}).done((err)=>{
	console.log('testGo1 OVER!');
})