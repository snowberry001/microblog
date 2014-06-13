$(document).ready(function(e) {
	$(window).keydown(function(e){
		// F5刷新屏幕，不会掉线
		if(e.keyCode == 116)
		{
			if(!confirm("刷新会将所有数据清空，确定要刷新么？"))
			{
				e.preventDefault();
			}
		}
		// 按Esc退出聊天室
		if (e.keyCode == 27)
		{
			if(!confirm("确定要退出聊天室吗？"))
			{
				e.preventDefault();
			}
			else
			{
				//socket.emit('offline', JSON.stringify({user: from}));
				socket.disconnect();
				return window.location.href = '/u/' + from;
			}
		}
    });
	// 获取存在title中的用户名 
	var from = $("title").html().split('-')[0];
	if (from == null)
	{
		return window.location.href = '/login';
	}
	var to = 'all';
	$("#input_content").html("");

	// 连接socket.io
	var socket = io.connect(); 
	// 触发上线事件 服务器端监听
	socket.emit('online', JSON.stringify({user: from}));
	// 监听下线事件
	socket.on('disconnect',function(){
		var msg = '<div style="color:#f00">SYSTEM:连接服务器失败</div>';
		addMsg(msg);
		$("#list").empty();
	});
	// 监听掉线重连事件
	socket.on('reconnect',function(){
		socket.emit('online',JSON.stringify({user: from}));
		var msg = '<div style="color:#f00">SYSTEM:重新连接服务器</div>';
		addMsg(msg);
	});
	// 监听系统消息提示事件
	socket.on('system',function(data){
		var data = JSON.parse(data);
		var time = getTimeShow(data.time);
		var msg = '';
		if(data.type =='online')
		{
			msg += '用户 ' + data.msg +' 上线了！';
		} else if(data.type =='offline')
		{
			msg += '用户 ' + data.msg +' 下线了！';
		} else if(data.type == 'in')
		{
			msg += '你进入了聊天室！';
		} else
		{
			msg += '未知系统消息！';
		}
		var msg = '<div style="color:#f00">SYSTEM('+time+'):'+msg+'</div>';
		addMsg(msg);
		play_ring("/sound/online.wav");
	});
	// 监听服务器发来的刷新在线用户列表事件
	socket.on('userflush',function(data){
		var data = JSON.parse(data);
		var users = data.users;
		flushUsers(users);
	});
	// 监听消息发送事件
	socket.on('say',function(msgData){
		var time = msgData.time;
		time = getTimeShow(time);
		var data = msgData.data;
		if (data.to=='all') {
			addMsg('<div>' + data.from + '('+time+')说：<br/>' + data.msg + '</div>');
			if (data.from != from)
			{
				play_ring("/sound/msg.wav");
			}
			
		} else if(data.from == from) {
			addMsg('<div>我(' + time + ')对' + data.to + '说：<br/>' + data.msg + '</div>');
		} else if(data.to == from)
		{
			addMsg('<div>' + data.from + '(' + time + ')对我说：<br/>' + data.msg + '</div>');
			play_ring("/sound/msg.mp3");
		}
	});
    
	// 消息提示输出函数
	function addMsg(msg){
	  $("#contents").append(msg);
	  $("#contents").append("<br/>");
	  $("#contents").scrollTop($("#contents")[0].scrollHeight);
	}
	// 刷新在线用户列表函数
	function flushUsers(users)
	{
		var ulEle = $("#list");
		ulEle.empty();
		ulEle.append('<li title="双击聊天" alt="all" onselectstart="return false">所有人</li>');
		for(var i = 0; i < users.length; i ++)
		{
			ulEle.append('<li alt="'+users[i]+'" title="双击聊天" onselectstart="return false">'+users[i]+'</li>')
		}
		//双击对某人聊天
		$("#list > li").dblclick(function(e){
			if($(this).attr('alt') != from)
			{
				to = $(this).attr('alt');
				show_say_to();
			}
		});
		show_say_to();
	}
	// shift+enter换行 enter发送消息
	$("#input_content").keydown(function(e) {
	  if(e.shiftKey && e.which==13){
		$("#input_content").append("<br/>");
	  } else if(e.which == 13)
	  {
		e.preventDefault();
		say();
	  }
	});
	// 点击发送消息
	$("#say").click(function(e){
		say();
	});

	// 消息发送函数
	function say()
	{
		if ($("#input_content").html() == "") {
			return;
		}
		socket.emit('say',JSON.stringify({to:to,from:from,msg:$("#input_content").html()}));
	  $("#input_content").html("");
	  $("#input_content").focus();
	}

	//显示正在对谁说话
	function show_say_to()
	{
		$("#from").html(from);
		$("#to").html(to=="all" ? "所有人" : to);
		var users = $("#list > li");
		for(var i = 0; i < users.length; i ++)
		{
			if($(users[i]).attr('alt')==to)
			{
				$(users[i]).addClass('sayingto');
			}
			else
			{
				$(users[i]).removeClass('sayingto');
			}
		}
	}
	// 播放消息提示音函数
	function play_ring(url){
		var embed = '<embed id="ring" src="' + url + '" loop="0" autostart="true" hidden="true" style="height:0px; width:0px;0px;"></embed>';
		$("#ring").html(embed);
	}
	// 获取指定格式时间函数
	function getTimeShow(time)
	{
		var dt = new Date(time);
		time = dt.getFullYear() + '-' + (dt.getMonth()+1) + '-' + dt.getDate() + ' '+dt.getHours() + ':' + (dt.getMinutes()<10?('0'+ dt.getMinutes()):dt.getMinutes()) + ":" + (dt.getSeconds()<10 ? ('0' + dt.getSeconds()) : dt.getSeconds());
		return time;
	}
});
