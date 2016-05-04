var then = require("../index");
var _ = require("underscore");


then.each([1,2,3],(next,value)=>{
	console.log(value);
	next('出错了');
})
.done((err)=>{
	console.log(err,"over!!");
})

