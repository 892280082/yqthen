  function slice (args, start) { // 将arguments 转成数组
    start = start || 0;
    if (start >= args.length) return [];
    var len = args.length;
    var ret = Array(len - start);
    while (len-- > start) ret[len - start] = args[len];
    return ret;
  }

function ThenEntity(){
	this._arrayFuncs = [];
	this._errorFuncs = [];
	this._funcProgress = [];
	this._arrayIndex = 0;
	this._errorIndex = 0;
	this._lastArgs = {};
	this._doneFunc = null;

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
		err = args.shift(); //去掉第一个占位的err

		if(args.length > 0){ //如果有参数传递，保存这些参数
			this._lastArgs = args;
		}else if(this._lastArgs.length>0){//如果没有参数，使用之前保存的参数
			this._lastArgs.shift();
			args = this._lastArgs;
		}

		var nextFunc = this._arrayFuncs[this._arrayIndex];

		if(nextFunc === 'done'){
			if(!this._doneFunc)
				return;
 			args.unshift(err);
 			var _this =   this._doneFunc.apply(null,args);
 			this._doneFunc = null;
 			return _this;
 		}

 		if(!err){
 			nextFunc = this._arrayFuncs[this._arrayIndex++];
 		}else{
			args.unshift(err);
			this._arrayIndex = this._funcProgress.shift();//获取下次运行的方法的下表
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

	this.done = function(func){
		this._doneFunc = func;
		return this.then('done');
	}.bind(this);

}

function ThenGoEntity (func,parent){
	this._arrayFuncs = [func];
	this._nextCount = 0;
	this.parent = parent;
	this.then = parent.then;
	this.fail = parent.fail;
	this.done = parent.done;

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
	this.done = parent.done;

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
添加done方法。
.done((err,args...)=>{  }); //终结方法，当运行完这个方法的时候结束then链。

_.defer方法需要重写


*/