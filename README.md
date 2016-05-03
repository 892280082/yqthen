yqthen.js
====
**写这个流程库的目的不是为了解决异步回调，而是为了最大限度的挖掘js异步
模型的优势。**

**相对于别的库来讲，这个库的API更加简洁优美，代码量更少。源码也非常简单,diy so easy!**

**具体优势可以看下面的用例**

## 测试用例
1. 向数据库查询10条用户信息。
2. 向每个用户发送短信，祝他们51快乐，并且只有当短信全部发送成功才执行 34步。
3. 通过新浪接口，查询每个用户发布的微博消息
4. 通过QQ接口，查询每个用户发布的说说 

```js
var then = require('yqthen');

then((next)=>{  //step1
	db.find((err,users)=>{
		/**如果next传递了两个以上的参数,则该参数会迭代到下个方法作为参数。
		直到被下一个符合条件的next覆盖。*/
		next(err,uers); 
	});
})
.each((next,user)=>{ //step2
	
	sendMsgUtil.send(user._id,"51快乐",(err)=>{
		next(err);
	});
})
.go((next,users)=>{ //step3

	then.each(users,(next,user)=>{ 
		sinaInterface.getNews(user._id,(err,sinaNews)=>{
			user.sinaNews = sinaNews;
			next(err);
		});
	});

})
.go((next,users)=>{ //step4

	then.each(users,(next,user)=>{
		qqInteterface.getNews(user._id,(err,qqNews)=>{
			user.qqNews = qqNews;
			next(err);
		});
	});
})
.then((next,users)=>{
	callback(users);
})
.fail((next,err)=>{
	/**捕获错误,可以有多个*/
});
```

## 执行流程
1. step1最先运行，执行成功后运行 step2.
2. step2 的each 循环是并发.
3. step3,4 在step2执行结束后运行，并且34是并发运行的,不存在先后关系。
4. fail 方法用来捕获异常，一个then链可以有多个fail

##这段代码能比较好的体现js的优势，写的少干的多，活还好。如果这段代码严格用java或者Php来写的话，不论是代码复杂度还是代码量都是要翻番的。希望js能发展的越来越好，改变现在小马拉大车的局面。

##API
1. then(Function) -待运行函数
2. each(Array?,Function,Limit?) -Array不设置会自动获取next传递的第二个参数 limit可以控制并发数.limit这版本为实现。
3. go(Function) -一个并发任务链,一个then链里面可以有多个go链。
4. fail(Function) -捕获异常

QQ 892280082 逐梦  
PS: 名字非主流，但是好多年不想换了,各位客官忍忍。

