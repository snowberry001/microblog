
/**
 * ChatServer
 */

var chatServer = function(socketio, server)
{   
	var io = socketio.listen(server, {log: false});
	var clients = [];
	var users = [];

	io.sockets.on('connection', function(socket){
	  socket.on('online', function(data){
		var data = JSON.parse(data);
		//����Ƿ����Ѿ���¼��
		if(!clients[data.user])
		{
		  //�������û�����Ҫ�����û���������,��Ҫ��ͻ��˷����µ��û��б�
		  users.unshift(data.user);
		  for(var index in clients)
		  {
			  clients[index].emit('system', JSON.stringify({type: 'online',msg: data.user, time:(new Date()).getTime()}));
			  clients[index].emit('userflush', JSON.stringify({users: users}));
		  }
		  socket.emit('system', JSON.stringify({type:'in', msg:'', time:(new Date()).getTime()}));
		  socket.emit('userflush', JSON.stringify({users: users}));
		}
		  clients[data.user] = socket;
		  socket.emit('userflush', JSON.stringify({users: users}));
	  });
	  socket.on('say', function(data){
		data = JSON.parse(data);
		var msgData = {
		  time : (new Date()).getTime(),
		  data : data
		}
		if(data.to == "all")
		{
		  //��������˵
		  for(var index in clients)
		  {
			clients[index].emit('say', msgData);
		  }
		}
		else
		{
		  //��ĳ��˵
		  clients[data.to].emit('say', msgData);
		  clients[data.from].emit('say', msgData);
		}
	  });
	  socket.on('offline', function(user){
		  //socket.emit('system', JSON.stringify({type:'in', msg:'', time:(new Date()).getTime()}));
		  socket.disconnect();
	  });
	  socket.on('disconnect', function(){
		//��������
		setTimeout(userOffline, 1000);
		function userOffline()
		{
		  for(var index in clients)
		  {
			if(clients[index] == socket)
			{
			  users.splice(users.indexOf(index),1);
			  delete clients[index];
			  for(var index_inline in clients)
			  {
				clients[index_inline].emit('system',JSON.stringify({type:'offline',msg:index,time:(new Date()).getTime()}));
				clients[index_inline].emit('userflush',JSON.stringify({users:users}));
			  }
			  break;
			}
		  }
		}
	  });
	});
}
module.exports = chatServer;