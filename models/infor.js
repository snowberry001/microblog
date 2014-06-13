var mongodb = require('./db.js');

function Infor(infor){
	this.username = infor.username;
	this.nickname = infor.nickname;
	this.sign = infor.sign;
	this.avatar = infor.avatar;
}

module.exports = Infor;

// Infor对象实例方法 update
Infor.update = function (query, doset, callback){
	mongodb.open(function(err, db){
		if (err)
		{
			return callback(err);
		}
		db.collection('infors', function(err, collection){
			if (err)
			{
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex('username', {unique: true});
			collection.update(query, {$set: doset}, {safe: true, upsert: true}, function(err){
				mongodb.close();
				callback(err);
			});
		});
	});
};
// Infor构造函数方法 get
Infor.get = function(options, callback){
	mongodb.open(function(err, db){
		if (err)
		{
			return callback(err);
		}
		db.collection('infors', function(err, collection){
			if (err)
			{
				mongodb.close();
				return callback(err);
			}
			collection.findOne(options, function(err, doc){
				mongodb.close();
				if (doc)
				{
					var infor =  new Infor(doc);
					callback(err, infor);
				}
				else 
				{
					callback(err, {nickname: "", sign: "", avatar: ""});
				}
			});
		});
	});
};