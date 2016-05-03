/**
业务要求
读取一个helloJs.text文件,并将内容保存到'DBXXX'数据库中，
在将该数据提交给远程服务器,地址http:XXX。

伪代码：
一般java或php代码的写法
try{

 file = readFile('helloJs.text'); //读取文件
 db = DB.open('DBXXX'); //打开数据库
 db.save(file); //数据库保存数据
 request('http:xxx',file); //像服务器提交数据

}catch(e){
	echo e  //捕获异常
}

代码貌似没有问题，但是这里读取文件和打开数据库的操作是可以同时运行的，
如果java用实现的话，可能就要使用多线程模型了。

如果用js实现的话，我想大家都会。但是用这个库写出来的代码绝对是最简洁优美的。

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
		callback(err);
	})
}).fail((next,err)=>{
	callback(err);  //捕获异常
})


虽然用了yqthen框架，但是异步代码还是没有同步代码简洁，这也是没有办法的事，希望js能像
形式同步更近一点。

但是我这里读取文件和打开数据库用go链连接，也就说这两个方法是并发的，是同时运行的。只有当
这两步操作成功后，才会像数据库保存数据，最后在向服务器提交数据。


*/