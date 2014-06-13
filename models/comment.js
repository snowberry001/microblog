var mongodb = require('./db.js');
var markdown = require("markdown").markdown;

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

function Comment(post_id, username, content, time){
	this.post_id = post_id;
	this.username = username;
	this.content = content;
	if (time)
	{
		this.time = time;
	}
	else
	{
		this.time = toDbString(new Date());

	}
	
};

module.exports = Comment;

// Comment对象实例方法 save
Comment.prototype.save = function (callback){
	var comment = {
		post_id: this.post_id,
		username: this.username,
	    content: this.content,
		time: this.time
	};
	mongodb.open(function(err, db){
		if (err)
		{ 
			mongodb.close();
			return callback(err);
		}
		db.collection('comments', function(err, collection){
			if (err)
			{
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex('post_id');
			collection.insert(comment, {safe: true}, function(err, comments){
				mongodb.close();
				callback(err, comments);
			});
		});
	});
};
// Comment构造函数方法 get
Comment.get = function(options, callback){
	mongodb.open(function(err, db){
		if (err)
		{
			return callback(err);
		}
		db.collection('comments', function(err, collection){
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
				var comments = [];
				docs.forEach(function(doc, index){
					var comment = new Comment(doc.post_id, doc.username, markdown.toHTML(doc.content), doc.time);
					comments.push(comment);
				});
				callback(null, comments);

			});
		});
	});
};