var http = require('http');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');

var getPic = function (callback)
{
	var url = 'http://sports.sina.com.cn/nba/';
	http.get(url , function(res){
		var stack = '';
		res.setEncoding('binary');
		res.on('data' , function(d){
			stack += d;
		}).on('error',function(err){
		console.log(err.message);
		});

		res.on('end' , function(){
			
			var buf = new Buffer(stack ,'binary');
			var data = iconv.decode(buf , 'gbk');
			var $ = cheerio.load(data);
			var picArr = [];
			
			$('.ct110').children('.item').each(function(){
				var picture = {};
				var selector = $(this).children().children('img');
				console.log($(this).children().children('img'));
				picture.src = selector.attr('src');
				picture.title = selector.attr('alt');
				picArr.push(picture);
			});
			return callback(picArr);

		}).on('error',function(err){
			console.log(err.message);
			return callback(null);
		})
	}).on('error', function(err){
		console.log(err.message);
		return callback(null);
	});
}

exports.getPic = getPic;