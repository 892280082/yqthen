var then = require("../index");
var _ = require("underscore");

then.each(_.range(0,100),(next,value)=>{
	setTimeout(()=>{
		console.log('value',value);
		next();
	},100);
},3).done((err)=>{
	console.log('test OVER');
});