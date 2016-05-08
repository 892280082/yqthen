yqthen.js
====
###习惯async的同学不妨试一试这个库，让你的代码更加清爽。
* async常用的API在这里都可以进行链式调用，并且API更加友好。
* 这个库处理并发非常方便，会让写出的程序有一定的性能提升。
* 参数迭代和异常捕捉都比async更加方便。

## 下面的用例分别用 async 和 yqthen实现。

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
2. each(Array?,Function,Limit?) -Array不设置会自动获取next传递的第二个参数 
3. go(Function) -一个并发任务链,一个then链里面可以有多个go链。
4. fail(Function) -捕获异常
5. done(err,args) -结束方法

QQ 892280082 逐梦  
PS: 名字非主流，但是好多年不想换了,各位客官忍忍。这个库还在改进中，最好不要直接使用。

