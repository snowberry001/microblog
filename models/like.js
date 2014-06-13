var mongodb = require('./db.js');

var toDbString = function(d) {
    var month = d.getMonth() + 1;
    if (month < 10) {
        month = '0' + month;
    }
    var day = d.getDate();
    if (day < 10) {
        day = '0' + day;
    }
    var hours = d.getHours() + 8;
    if (hours < 10) {
        hours = '0' + hours;
    }
    var min = d.getMinutes();
    if (min < 10) {
        min = '0' + min;
    }
    return d.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + min;
};

function Like(post_id, username, time){
	this.post_id = post_id;
	this.username = username;	
	if (time)
	{
		this.time = time;
	}
	else
	{
		this.time = toDbString(new Date());

	}
};

module.exports = Like;

// Like对象实例方法 save
Like.prototype.save = function (callback){
	var like = {
		post_id: this.post_id,
		username: this.username,
		time: this.time
	};
	mongodb.open(function(err, db){
		if (err)
		{ 
			mongodb.close();
			return callback(err);
		}
		db.collection('likes', function(err, collection){
			if (err)
			{
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex('post_id');
			collection.insert(like, {safe: true}, function(err, likes){
				mongodb.close();
				callback(err, likes);
			});
		});
	});	
};


// Like构造函数方法 get
Like.get = function(options, callback){
	mongodb.open(function(err, db){
		if (err)
		{   
			mongodb.close();
			return callback(err);
		}
		db.collection('likes', function(err, collection){
			if (err)
			{
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if (options)
			{
				query = options;
			}
			collection.find(query).toArray(function(err, docs){
				mongodb.close();
				if (err)
				{
					callback(err, null);
				}
				var likes = [];
				docs.forEach(function(doc, index){
					var like = new Like(doc.post_id, doc.username, doc.time);
					likes.push(like);
				});
				callback(null, likes);
			});
		});
	});
};