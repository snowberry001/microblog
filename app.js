
/**
 * Module dependencies.
 */
var flash = require('connect-flash');
var settings = require('./settings');
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var io = require('socket.io');
var app = express();
var server = http.createServer(app);
var chatServer = require('./servers/chatServer');
var MongoStore = require('connect-mongo')(express);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session({
	  cookie: {maxAge: 2 * 60 * 36000},
	  secret: settings.cookieSecret,
	  store: new MongoStore({db: settings.db })
  }));
  app.use(flash());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);

  // 视图助手，即全局函数或者对象
  app.locals({});
  app.use(function(req, res, next){
		if (!req.session.user)
		{
			req.flash('error', '未登录');
			return res.redirect('/login');
		}
		next();
  });
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//routes
app.get('/', routes.index);
app.get('/u/:user', routes.checkLogin);
app.get('/u/:user', routes.user);
app.post('/post', routes.post);
app.get('/reg', routes.checkNotLogin);
app.get('/reg', routes.reg);
app.post('/reg', routes.checkNotLogin);
app.post('/reg', routes.doReg);
app.get('/login', routes.checkNotLogin);
app.get('/login', routes.login);
app.post('/login', routes.checkNotLogin);
app.post('/login', routes.doLogin);
app.post('/qqLogin', routes.checkNotLogin);
app.post('/qqLogin', routes.qqLogin);
app.get('/logout', routes.checkLogin);
app.get('/logout', routes.logout);
app.get('/search', routes.search);
app.post('/reply', routes.reply);
app.post('/dolike', routes.doLike);
app.get('/findpwd', routes.findPwd);
app.post('/findpwd', routes.find);
app.get('/chat', routes.checkLogin);
app.get('/chat', routes.chat);
app.get('/update', routes.checkLogin);
app.get('/update', routes.update);
app.post('/update', routes.checkLogin);
app.post('/update', routes.doUpdate);
app.post('/update/upload', routes.upload);
app.get('/callback', routes.qqCallback);
app.post('/qqsave', routes.qqSave);

// http服务器
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
// socket.io监听
chatServer(io, server);
