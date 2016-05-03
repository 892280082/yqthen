var then = require("../index");
var _ = require("underscore");


var Net = {
	openSocket:(callback)=>{
		_.delay(()=>{
			callback(_.random(0,20)>19? '网络打开错误' : null);
		},100);
	}
}

var DB = {
	open:(callback)=>{
		_.delay(()=>{
			callback(_.random(0,20)>19? '数据库打开错误' : null);
		},100);
	}
}


var Customer = {
	find:(callback)=>{
		_.delay(()=>{
			var docs = [{_id:"abc1",name:"小镇"},
						{_id:"abc2",name:"小丽"},
						{_id:"abc3",name:"小芳"},
						{_id:"abc4",name:"小海"}];
			callback(_.random(0,20)>19?'查询数据库出错':null,docs);
		},50);
	}
};

var WeiXinAuth2 = {
	getOpenIdForId:(_id,callback)=>{
		_.delay(()=>{
			return callback(_.random(0,20)>19?'第三方请求出错':null,_id+"adsf234gfh");
		},100);
	}
};

/**
测试流程如下:
1.Net.openSocket -打开网络socket链接，耗时 100MS 5%几率抛出异常

2.DB.open -打开数据库链接 耗时100MS 5%几率抛出异常

3.Customer.find -查询数据库  获得文档数量 4条   耗时100MS 5%几率抛出异常

4.WeiXinAuth2.getOpenIdForId -向微信服务器请求，获得每个用户的openId  每条耗时50MS 5%几率抛出异常

#####################################
同步方法处理业务
打开NET 100MS
打开数据库 100MS
查询数据100MS
查询每个用户openId = 50*4 
共耗时 500MS

######################################
yqThen 流程库异步处理业务
db和net为并行打开，共耗时100MS 
数据库查询100MS
微信服务器并发请求 50MS
共耗时 250MS

yqThen 流程库特点： 
1.多任务并行执行 + promise + each异步循环 均为链式回调。
2.统一的报错处理
3.统一的参数迭代。 例如查询数据库的next(err,docs)的docs参数 迭代到之后的each，then方法中。
*/
then
.go((next)=>{  //并行打开socket链接
	Net.openSocket((err)=>{
		next(err);
	});
})
.go((next)=>{ //并行打开数据库
	DB.open((err)=>{
		next(err);
	});
})
.then((next)=>{ //查询数据库
	Customer.find((err,docs)=>{
		next(err,docs);
	});
})
.each((next,value)=>{ //并发请求微信服务器获得openId
	WeiXinAuth2.getOpenIdForId(value._id,(err,openId)=>{
		value.openId = openId;
		next(err);
	});
})
.then((next,docs)=>{ //处理结果
	console.log("result:",docs);
})
.fail((next,err)=>{ //捕获异常
	console.log(err);
});


