var then = require("../index");
var _ = require("underscore");

then.each(_.range(0,100),(next,value)=>{
	console.log('value',value);
	next();
}).done((err)=>{
	console.log('test OVER');
});