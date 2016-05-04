yqthen.js
====
**写这个流程库的目的不是为了解决异步回调，而是为了最大限度的挖掘js异步
模型的优势。将js的长处发挥到极致 **

**相对于别的库来讲，这个库的API更加简洁优美，代码量更少。源码也非常简单,diy so easy!**

**具体优势可以看下面的用例**

## 测试用例
业务要求
读取一个helloJs.text文件,并将内容保存到’DBXXX’数据库中，
在将该数据提交给远程服务器,地址http:XXX。
如果提交成功，在把文件转成行，每一行一条记录，存到DBXXX数据库中。

伪代码：
一般java或php代码的写法

```js
try{
 file = readFile('helloJs.text'); //读取文件
 db = DB.open('DBXXX'); //打开数据库
 db.save(file); //数据库保存数据
 request('http:xxx',file); //像服务器提交数据
 lines = file.convertLine;//转换成行
 for(var i=0;i<lines.length;i++){
  	db.save(lines[i]); //每行一条数据，保存到数据库
 }
}catch(e){
	echo e  //捕获异常
}   
```

代码貌似没有问题，但是这里读取文件和打开数据库的操作是可以同时运行的，
如果java用实现的话，可能就要使用多线程模型了。

如果用js实现的话，我想大家都会。
###但是用这个库写出来的代码绝对是最简洁优美的。
###这里的读取文件和打开数据库是并发的。

```js
var then = require('yqthen');

var file,db;
then.go((next)=>{
	readFile('helloJs.text',(err,file)=>{ //读取文件
		file = file;
		next(err);
	})
}).go((next)=>{
	DB.open('DBXXX',(err,db)=>{  //打开数据库
		db = db;
		next(err);
	})
}).then((next)=>{
	db.save(file,(err)=>{  //数据库保存数据
		next(err);
	})
}).then((next)=>{
	request('http:xxx',file,(err)=>{ //像服务器提交数据
		next(err);
	})
}).each(file.convertLine,(next,line)=>{
	db.save(line,(err)=>{  //每行一条记录保存到数据库
		next(err);
	})
})
.then((next)=>{
	callback(null); //操作成功
})
.fail((next,err)=>{
	callback(err);  //捕获异常
})
```

虽然用了yqthen框架，但是异步代码还是没有同步代码简洁，这也是没有办法的事，希望js能像
形式同步更近一点。

但是我这里读取文件和打开数据库用go链连接，也就说这两个方法是并发的，是同时运行的。只有当
这两步操作成功后，才会像数据库保存数据，最后在向服务器提交数据。


##API
1. then(Function) -待运行函数
2. each(Array?,Function,Limit?) -Array不设置会自动获取next传递的第二个参数 limit可以控制并发数.limit这版本为实现。
3. go(Function) -一个并发任务链,一个then链里面可以有多个go链。
4. fail(Function) -捕获异常

QQ 892280082 逐梦  
PS: 名字非主流，但是好多年不想换了,各位客官忍忍。这个库还在改进中，最好不要直接使用。

