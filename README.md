yqthen.js
====
###API已经稳定，本人已经用于项目中。
###如果出现bug，请npm update yqthen 升级到最新版。

###习惯async的同学不妨试一试这个库，让你的代码更加清爽。
* async 常用的API在这里都可以进行链式调用，并且API更加友好。
* go 简单暴力的实现多任务并发。
* each 异步循环实现的非常优美，并且可以限制并发数。
* 参数迭代和异常捕捉都比async更加方便。

## 下面的用例分别用 yqthen  和 async实现。

1. 读取一个helloJs.text文件,并将内容保存到’DBXXX’数据库中，
2. 在将该数据提交给远程服务器,地址http:XXX。
3. 如果提交成功，在把文件转成行，每一行一条记录，存到DBXXX数据库中。

```js
var then = require('yqthen');

var file,db;
then
.go((next)=>{
	readFile('helloJs.text',(err,file)=>{ //读取文件
		file = file;
		next(err);
	})
})
.go((next)=>{
	DB.open('DBXXX',(err,db)=>{  //打开数据库
		db = db;
		next(err);
	})
})
.then((next)=>{
	db.save(file,(err)=>{  //数据库保存数据
		next(err);
	})
})
.then((next)=>{
	request('http:xxx',file,(err)=>{ //像服务器提交数据
		next(err);
	})
})
.each(file.convertLine,(next,line)=>{
	db.save(line,(err)=>{  //每行一条记录保存到数据库
		next(err);
	})
},20) //最大并发20
.then((next)=>{
	callback(null); //操作成功
})
.fail((next,err)=>{
	callback(err);  //捕获异常
})
```

###这里在特地比较一下async
```js
async.waterfall([
	function(callback){
		async.parallel([ //并行运行
			function(){ //读取文件
				readFile('helloJs.text',(err,file)=>{ //读取文件
					file = file;
				})
			},
			function(){ //打开数据库
				DB.open('DBXXX',(err,db)=>{  //打开数据库
					db = db;
				})
			}
		],
		function(err, results){
			callback(null, fs, db,callback);
		});
	},
	function(fs, db, callback){
		request('http:xxx',file,(err)=>{ //像服务器提交数据
			callback(null,fs,db);
		})
	},
	function(fs,db, callback){
		async.eachSeries(fs.convertLine, function iteratee(line, callback) { //循环并发
			db.save(line,(err)=>{  //每行一条记录保存到数据库
				callback(err);
			})
		});
	}
], function (err, result) {
	console.log(err,result);  
});
//我已经被这个嵌套搞崩溃了！！！
```

##API
1. then(Function) -待运行函数
2. each(Array?,Function,Number?) -Array不设置会自动获取next传递的第二个参数 
3. go(Function) -一个并发任务链,一个then链里面可以有多个go链。
4. fail(Function) -捕获异常
5. done(err,args) -结束方法


###each+done方法示例
```js
var ids=[_id1,_id2.....];//数据库取出来的ID数组
var results = [];//查询的结果数组
then.each(ids,(next,value,index)=>{ 
	/**
	*一般查询数据库都会限制并发数，超过数据库最大连接数的并发是没有意义的。
	*并且同一时刻像消息队列放入过多的函数，很容易导致栈溢出。
	*这是用async的朋友经常遇到的问题
	*/
	DB.findOne(value,(err,doc)=>{ 
		results.push(doc);
		next(err);
	})
},20).done((err)=>{
	if(err){
		console.log("运行出错":,err);
	}else{
		console.log("查询结果",results);
	}
})
```


QQ 892280082 逐梦  
PS: 名字非主流，但是好多年不想换了,各位客官忍忍。

