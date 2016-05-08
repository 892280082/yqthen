var then = require("../index");
var _ = require("underscore");

then((next)=>{

	setTimeout(()=>{
		console.log('test start!');
		next(null,_.range(1,100));
	},0);
	
}).each((next,value,index)=>{

	setTimeout(()=>{
		console.log('value:',value,index);
		next();
	},20);

},3).done((err)=>{
	err = err || '运行结束';
	console.log('err:',err);
});


then((next)=>{
	console.log('test2 start!');
	next();
}).each([1,2,3],(next,value)=>{
	console.log(value);
	next();
}).each(['a','b','c'],(next,value)=>{
	console.log(value);
	next();
}).done((err)=>{
	console.log('test2 OVER!',err);
})