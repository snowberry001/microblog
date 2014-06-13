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
	// 欧洲服务器 差8个小时
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

function Post(username, post, time){
	this.username = username;
	this.post = post;
	if (time)
	{
		this.time = time;
	}
	else
	{
		this.time = toDbString(new Date());

	}
	
};

module.exports = Post;

// Post对象实例方法 save
Post.prototype.save = function (callback){
	var post = {
		username: this.username,
	    post: this.post,
		time: this.time
	};
	mongodb.open(function(err, db){
		if (err)
		{
			return callback(err);
		}
		db.collection('posts', function(err, collection){
			if (err)
			{
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex('username');
			collection.insert(post, {safe: true}, function(err, posts){
				mongodb.close();
				callback(err, posts);
			});
		});
	});
};
// Post构造函数方法 get
Post.get = function(username, page, callback){
	mongodb.open(function(err, db){
		if (err)
		{
			return callback(err);
		}
		db.collection('posts', function(err, collection){
			if (err)
			{
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if (username)
			{
				query.username = username;
			}
			collection.find(query, {skip: (page-1)*3, limit: 3}).sort({time: -1}).toArray(function(err, docs){
				//mongodb.close();
				if (err)
				{
					callback(err, null);
				}
				var posts = [];
				var post_ids = [];
				docs.forEach(function(doc, index){
					var post = new Post(doc.username, doc.post, doc.time);
					posts.push(post);
					post_ids.push(doc._id);
				});
				collection.find(query).toArray(function(err, allposts){
				   mongodb.close();
				   if (err)
				   {
					   callback(err, null);
				   }
				   callback(null, allposts.length, posts, post_ids);
				});
			});
		});
	});
};

//模糊查询
Post.getSearch = function(key, page, callback){
	mongodb.open(function(err, db){
		if (err)
		{
			return callback(err);
		}
		db.collection('posts', function(err, collection){
			if (err)
			{
				mongodb.close();
				return callback(err);
			}
			var query = {};
			collection.find(query).sort({time: -1}).toArray(function(err, docs){
				mongodb.close();
				if (err)
				{
					callback(err, null);
				}
				var posts = [];
				var post_ids = [];
				for (var index = 0; index < docs.length; index ++)
				{
					var doc = docs[index];
					if (doc.username.indexOf(key)!= -1 || doc.post.indexOf(key)!= -1 || doc.time.indexOf(key)!= -1)
					{
						var post = new Post(doc.username, doc.post, doc.time);
						posts.push(post);
						post_ids.push(doc._id);
					}
				}
				var postArr = [];
				post_idArr = [];
				for (var i = (page -1)*3; i < page*3 && i < posts.length; i++)
				{
					postArr.push(posts[i]);
					post_idArr.push(post_ids[i]);
				}
				callback(null, posts.length, postArr, post_idArr);
			});
		});
	});
};