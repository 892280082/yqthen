var then = require("../index");
var _ = require("underscore");

var array = _.range(2,100);

then.each(array,(next,value,index)=>{
	setTimeout(()=>{
		console.log('value',value,index);
		next();
	},100);
},3).done((err)=>{
	console.log('test OVER');
	console.log("array",array.length);

});

then.each([],function(next,value){
	console.log(value);
	next();
}).done(function(err){
	console.log('[] test over!');
});