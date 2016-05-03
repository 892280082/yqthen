var then = require('../index.js');

then((next)=>{
	db.find((err,users)=>{
		next(err,uers);
	});
})
.each((next,user)=>{
	/**如果next传递了两个以上的参数,则该参数会迭代到下个方法作为参数。直到被下一个符合条件的next覆盖。*/
	sendMsgUtil.send(user._id,"51快乐",(err)=>{
		next(err);
	});
})
.go((next,users)=>{

	then.each(users,(next,user)=>{
		sinaInterface.getNews(user._id,(err,sinaNews)=>{
			user.sinaNews = sinaNews;
			next(err);
		});
	});

})
.go((next,users)=>{

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
/**捕获错误*/
});
/**一个then链可以有多个fail**/