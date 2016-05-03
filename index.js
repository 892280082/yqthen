  // 将 `arguments` 转成数组，效率比 `[].slice.call` 高很多
  function slice (args, start) {
    start = start || 0;
    if (start >= args.length) return [];
    var len = args.length;
    var ret = Array(len - start);
    while (len-- > start) ret[len - start] = args[len];
    return ret;
  }

//then 回调函数链对象
function ThenEntity(){
	this._arrayFuncs = []; //将要运行的函数队列
	this._errorFuncs = [];//捕捉错误的函数运行队列
	this._funcProgress = [];//保存放入纠错函数时，运行函数的状态
	this._arrayIndex = 0;
	this._errorIndex = 0;
	this._lastArgs = {};

	this._init = function(func){
		func = func || function(next){next()};

		var _this = this;
		_this._arrayFuncs.push(func);

		setTimeout(function(){
			_this._arrayFuncs[_this._arrayIndex++](_this._defer);
		},0);

	}.bind(this);

	this._defer = function(err){

		var args = slice(arguments);
		err = args.shift();
		if(args.length > 0){
			this._lastArgs = args;
		}else if(this._lastArgs.length>0){
			this._lastArgs.shift();
			args = this._lastArgs;
		}

		var nextFunc;
		if(!err){
		 	nextFunc = this._arrayFuncs[this._arrayIndex++];
		}else{
			args.unshift(err);
			this._arrayIndex = this._funcProgress.shift();
			nextFunc = this._errorFuncs[this._errorIndex++];
		}

		if(nextFunc){
			args.unshift(this._defer);
			nextFunc.apply(null,args);
		}

	}.bind(this);
	
	this.then=function(func){

		this._arrayFuncs.push(func);
		return this;

	}.bind(this);

	this.fail=function(func){

		this._funcProgress.push(this._arrayFuncs.length);
		this._errorFuncs.push(func);
		return this;

	}.bind(this);

	this.each=function(array,func){
		if(!func){
			func = array;
			array = null;
		}

		var thenEachPojo = new ThenEachEntity(array,func,this);
		return this.then(thenEachPojo.start);

	}.bind(this);

	this.go = function(func){

		var thenGo = new ThenGoEntity(func,this);
		this.then(thenGo.start);
		return thenGo;

	}.bind(this);

}

function ThenGoEntity (func,parent){
	this._arrayFuncs = [func];
	this._nextCount = 0;
	this.parent = parent;
	this.then = parent.then;
	this.fail = parent.fail;

	this._next = function(err){
		if(err)
			return this.parent._defer(err);

		if(++this._nextCount === this._arrayFuncs.length)
			return this.parent._defer();

	}.bind(this);

	this.start = function(){

		var _this = this;
		this._arrayFuncs.forEach(function(tempFunc){
			tempFunc(_this._next);
		});

	}.bind(this);

	this.go = function(func){
		this._arrayFuncs.push(func);
		return this;
	}.bind(this);

}


function ThenEachEntity (array,itretor,parent){
	this._array = array;
	this._itretor = itretor;
	this._nextCount = 0;
	this.parent = parent;
	this.fail = parent.fail;

	this._selfNext = function(err){

		if(err)
			return this.parent._defer(err);

		if(++this._nextCount === this._array.length)
			return this.parent._defer();

	}.bind(this);

	this.start = function(){

		if(!this._array)
			this._array = this.parent._lastArgs[1];

		var _this = this;
		_this._array.forEach(function(value,index){
			_this._itretor(_this._selfNext,value,index);
		});

	}.bind(this);
}

//对外提供的函数
function ThenStart(func){
	var then = new ThenEntity();
	then._init(func);
	return then;
}

ThenStart.go = function(func){
	var then = this();
	return then.go(func);
};

ThenStart.each = function(array,func){
	var then = this();
	return then.each(array,func);
};

module.exports = ThenStart;

/**
//待实现 
1.添加each方法 循环体 也可以提供链式调用  设计思路

//如果 typeof Array 为 function  则调用args.1
then.each(array[Array]?,itretor[Function]);

return thenEntity


then.each([1,2,3],(next,value,index)=>{
	_.defer(()=>{
		console.log("index:",value);
		next();
	});
})



2.添加go 方法 并行执行

then
.go((next)=>{
	netIo.open((err)=>{
		next(err);
	});
})
.go((next)=>{
	dbIo.open((err)=>{
		next(err);
	});
})

//设计思路
then对象 添加go方法，go方法生成go对象。
go对象拥有 go 和 then　方法。
go方法 是像该对象添加并发运行的函数
then方法是thenEntity的then方法。

*/