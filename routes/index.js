
/*
 * GET home page.
 */

var crypto = require('crypto');
var url = require('url');
var nodemailer = require("nodemailer");
var md = require("node-markdown").Markdown;

var User = require('../models/user.js');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');
var Like = require('../models/like.js');
var Infor = require('../models/infor.js');
var settings = require('../settings');
var crawler = require('./crawler.js');

exports.checkLogin = function(req, res, next){
	if (!req.session.user)
	{
		req.flash('error', '未登录');
		return res.redirect('/login');
	}
	next();
};

exports.checkNotLogin =  function(req, res, next){
	if (req.session.user)
	{
		req.flash('error', '已登录');
		return res.redirect('/');
	}
	next();
};

exports.index = function(req, res){
	var page = Number(req.query.p);
	if (!page)
	{
		page = 1;
	}
	else {
		page = parseInt(page);
	}
	Post.get(null, page, function(err, counts, posts, post_ids){
		req.session.success = '';
		req.session.error = '';
		req.session.sayat = 'homepage';
		req.session.page = page;
		req.session.pages = parseInt((counts+2)/3);
		Comment.get(null, function(err, comments){
			Like.get(null, function(err, likes){
				var like_num = {};
				var comment_num = {};
				post_ids.forEach(function(post_id, index){
					like_num[post_id] = getNum(likes, post_id);
					comment_num[post_id] = getNum(comments, post_id);
			   });
			   if(req.session.user){
				   crawler.getPic(function(picArr){
						console.log(picArr);
						res.render('index', { title: '博客首页', picArr: picArr, posts: posts, post_ids: post_ids, comments: comments, comment_num: comment_num, like_num: like_num, session: req.session });
				    });
			   }else{
					res.render('index', { title: '博客首页', picArr: null, posts: posts, post_ids: post_ids, comments: comments, comment_num: comment_num, like_num: like_num, session: req.session });
			   } 
			   
			});
			
		});
		
	});
	
};

function getNum(likes, post_id){
	var count = 0;
	likes.forEach(function(like, index){
		if (like.post_id == post_id)
		{
			count ++;
		}
	});
	return count;
};

exports.user = function(req, res){
	var page = Number(req.query.p);
	if (!page)
	{
		page = 1;
	}
	else {
		page = parseInt(page);
	}
	User.get({name: req.params.user}, function(err, user){
		if (!user)
		{
			req.flash('error', '用户不存在');
			return res.redirect('/');
		}
		Post.get(user.name, page ,function(err, counts, posts, post_ids){
			if (err)
			{
				req.flash('error', err);
			    return res.redirect('/');
			}
			req.session.sayat = 'userpage';
			req.session.page = page;
		    req.session.pages = parseInt((counts+2)/3);
			if (user.name == req.session.user)
			{
				req.session.myself = true;
			}
			else
			{
				req.session.myself = false;
			}
			Comment.get(null, function(err, comments){
				Like.get(null, function(err, likes){
					var like_num = {};
					var comment_num = {};
					post_ids.forEach(function(post_id, index){
						like_num[post_id] = getNum(likes, post_id);
						comment_num[post_id] = getNum(comments, post_id);
				   });
				   Infor.get({username: req.params.user}, function(err, infor){
					   if (err)
					   {
						   return res.redirect('/');
					   }
					   
					   return res.render('user', { title: req.session.user, posts: posts, post_ids: post_ids, comments: comments, comment_num: comment_num, like_num: like_num, infor: infor, session: req.session });
					    
				   });
			   
			   });
		    });
	    });
	});
};

exports.post = function(req, res){
	if (!req.session.user)
	{
		return res.redirect('/login');
	}
	var currentUser = req.session.user;
	if (!req.body.post.replace(/(\s*$)/g,""))
	{
        req.flash('error', '发布内容不能为空');
		if (req.session.sayat == 'homepage')
		{
			return res.redirect('/');
		}
		else
		{
			return res.redirect('/u/' + currentUser);
		}
		
	}
	var post = new Post(currentUser, req.body.post);
	post.save(function(err){
		if (err)
		{
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', '发布成功');
		if (req.session.sayat == 'homepage')
		{
			res.redirect('/');
		}
		else
		{
			res.redirect('/u/' + currentUser);
		}	
	});
  
};

exports.reg = function(req, res){
	req.session.success = '';
	req.session.error = '';
	res.render('reg', { title: '用户注册', session: req.session });
  
};

exports.doReg = function(req, res){

	var password = crypto.createHash('md5').update(req.body.password).digest('base64');
	var newUser = new User({
		name: req.body.username,
		password: password,
		email: req.body.email
	});
	User.get({name: newUser.name}, function(err, user){
		if (user)
		{
			return res.send({flag: 1});
		}
		if (err)
		{   
		    return res.send({flag: 2});
		}
		User.get({email: newUser.email}, function(err, email){
			if (email)
			{
				return res.send({flag: 3});
			}
			if (err)
			{   
				return res.send({flag: 2});
			}
			newUser.save(function(err){
				if (err)
				{
					return res.send({flag: 2});
				}
				req.session.user = newUser.name;
				return res.send({flag: 4});
		    });
		});		
	});
};




exports.login = function(req, res){
	res.render('login', { title: '用户登录', session: req.session, flash: req.flash });
  
};

exports.doLogin = function(req, res){
	if (!req.body['username'])
	{
		req.flash('error','用户名不能为空');
		req.session.error = '用户名不能为空';
		return res.redirect('/login');
		
	}
	if (!req.body['password'])
	{
		req.flash('error','用户密码不能为空');
		req.session.error = '用户密码不能为空';
		return res.redirect('/login');
		
	}
	User.get({name: req.body['username']}, function(err, user){
		if (err)
		{
			req.flash('error','登录失败，请重新尝试');
			req.session.error = error;
			return res.redirect('/login');
			
		}
		if (!user)
		{
			req.flash('error','用户名不存在');
			req.session.error = '用户名不存在';
			return res.redirect('/login');
			
		}
		var password = crypto.createHash('md5').update(req.body.password).digest('base64');
		if (user.password != password)
		{
			req.flash('error','用户密码错误');
			req.session.error = '用户密码错误';
			return res.redirect('/login');
			
		}
		req.session.success = '用户登录成功';
		req.session.user = user.name;
		req.session.error = '';
		return res.redirect('/');
	});
  
};

// qq合作登录
exports.qqLogin = function(req, res){
	var username = req.body.username;
	if (!username)
	{
		return res.send({flag: 1});
	}
	req.session.user = username;
	return res.send({flag: 2});

};

exports.qqCallback = function(req, res){
	return res.render('callback', {title: 'qqLogin'});

};

exports.qqSave = function(req, res){
	var username = req.body.username;
	if (!username)
	{
		req.session.user = null;
		return res.send({flag: 2});
	}
	req.session.user = username;
	return res.send({flag: 1});

};

exports.logout = function(req, res){
	req.session.destroy();
	res.redirect('/');
  
};

exports.search = function(req, res){
	var page = Number(req.query.p);
	if (!page)
	{
		page = 1;
	}
	else {
		page = parseInt(page);
	}
	//注意中文编码转换utf8
	var queryString = url.parse(decodeURI(req.url)).query;
	var key = queryString.split('&')[0].toString().split('=')[1];
	if (!key.replace(/(\s*$)/g,""))
	{
		req.session.page = page;
		req.session.pages = 1;
		req.session.counts = 0;
		return res.render('search', {title: 'Search', posts: [], post_ids: [], comments: [], session: req.session});
	}
	Post.getSearch(key, page, function(err, counts, posts, post_ids){
		if (err)
		{
			return res.render('search', {title: 'Search', posts: [], post_ids: [], comments: [], session: req.session});
		}
		if (posts.length == 0)
		{
			req.session.page = page;
		    req.session.pages = 1;
			req.session.counts = 0;
			return res.render('search', {title: 'Search', posts: [], post_ids: [], comments: [], session: req.session});
		}
		Comment.get(null, function(err,comments){
			Like.get(null, function(err, likes){
				var like_num = {};
				var comment_num = {};
				post_ids.forEach(function(post_id, index){
					like_num[post_id] = getNum(likes, post_id);
					comment_num[post_id] = getNum(comments, post_id);
			    });
				req.session.page = page;
				req.session.pages = parseInt((counts+2)/3);
				req.session.counts = counts;
				req.session.key = key;
				return res.render('search', {title: 'Search', posts: posts, post_ids: post_ids, comments: comments, comment_num: comment_num, like_num: like_num, session: req.session});
		    });
	    });
	});
};

exports.reply = function(req, res){
	if (!req.session.user)
	{
		return res.redirect('/login');
	}
	var currentUser = req.session.user;
	if (!req.body.reply.replace(/(\s*$)/g,""))
	{
        req.flash('error', '发布内容不能为空');
		if (req.session.sayat == 'homepage')
		{
			return res.redirect('/');
		}
		else
		{
			return res.redirect('/u/' + currentUser);
		}	
	}
	var comment = new Comment(req.body.post_id, currentUser, req.body.reply);
	comment.save(function(err){
		if (err)
		{
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', '发布成功');
		if (req.session.sayat == 'homepage')
		{
			res.redirect('/');
		}
		else
		{
			res.redirect('/u/' + currentUser);
		}	
	});
};

exports.doLike = function(req, res){
	if (!req.session.user)
	{
		return res.send({flag: 1});
	}
	Like.get({post_id: req.body.post_id, username: req.session.user}, function(err, likes){
		if (err)
		{
			return res.send({flag: 2});
		}
		if (likes.length !=0)
		{
			return res.send({flag: 4});
		}
		var newLike = new Like(req.body.post_id, req.session.user);
		newLike.save(function(err, likes){
			if (err)
			{
				return res.send({flag: 2});
			}
			return res.send({flag: 3});
		});
	});
};

exports.findPwd = function(req, res){
	res.render('findpwd', {title: '找回密码', session: req.session});
};

exports.find = function(req, res){
	var email = req.body.email;
	User.get({email: email}, function(err, emails){
		if (err)
		{
			return res.send({flag: 1});
		}
		if (emails == null)
		{
			return res.send({flag: 2});
		}
		// 发送邮件
		var smtpTransport = nodemailer.createTransport("SMTP",{
			host: settings.mail_host, 
			secureConnection: settings.mail_secureConnection,
			port: settings.mail_port, 
			auth: {
				user: settings.auth_user,
				pass: settings.auth_pass
			},
			debug: settings.mail_debug
		});
		var mailOptions = {
			from: settings.mail_from,
			to: emails.email, 
			subject: settings.mail_subject, 
			text: "您的密码是" + emails.password + "，顺便提醒下，您的用户名是" + emails.name + "。感谢您使用Skysnow，祝您生活愉快！",
			html: "" 
		}
		smtpTransport.sendMail(mailOptions, function(err, response){
			if(err)
			{
				return res.send({flag: 1});
			}
			else
			{
				console.log("Message sent: " + response.message);
			}
			res.send({flag: 3});
		    return smtpTransport.close(); 
			
		});
	});
};

exports.chat = function(req, res){
	res.render('chat', {session: req.session});
};

exports.update = function(req, res){
	Infor.get({username: req.session.user}, function(err, infor){
		if (err)
		{
			return res.render('update', {title: '用户信息修改', session: req.session, infor: {nickname: "", sign: "", avatar: ""}});
		}
		return res.render('update', {title: '用户信息修改', session: req.session, infor: infor});
	});
	
};

exports.doUpdate = function(req, res){
	var nickname = req.body.nickname;
	var sign = req.body.sign;
	var username = req.session.user;
	Infor.update({username: username}, {nickname: nickname, sign: sign}, function(err){
		if (err)
		{
			return res.send({flag: 2});
		}
		return res.send({flag: 1});
	});
};

exports.upload = function(req, res) {
	if (!req.session.user)
	{
		return res.send({flag: 1});
	}
	var username = req.session.user;
	Infor.update({username: username}, {avatar: req.body.avatar}, function(err){
		if (err)
		{
			return res.send({flag: 2});
		}
		return res.send({flag: 3});
	});
};