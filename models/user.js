var mongodb = require('./db.js');

function User(user){
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
}

module.exports = User;

// User对象实例方法 save
User.prototype.save = function (callback){
	var user = {
		name: this.name,
		password: this.password,
		email: this.email
	};
	mongodb.open(function(err, db){
		if (err)
		{
			return callback(err);
		}
		db.collection('users', function(err, collection){
			if (err)
			{
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex('name', {unique: true});
			collection.insert(user, {safe: true}, function(err, users){
				mongodb.close();
				callback(err, users);
			});
		});
	});
};
// User静态方法 get
User.get = function(options, callback){
	mongodb.open(function(err, db){
		if (err)
		{
			return callback(err);
		}
		db.collection('users', function(err, collection){
			if (err)
			{
				mongodb.close();
				return callback(err);
			}
			collection.findOne(options, function(err, doc){
				mongodb.close();
				if (doc)
				{
					var user =  new User(doc);
					callback(err, user);
				}
				else 
				{
					callback(err, null);
				}
			});
		});
	});
};