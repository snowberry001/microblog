$(document).ready(function(){
    var preNickname = $("#nickname").val().trim();
    var preSign = $("#sign").val().trim();
	$("#btn_update").click(function(){
		var nickname = $("#nickname").val().trim();
		var sign = $("#sign").val().trim();
		if (preNickname == nickname && preSign == sign)
		{
			return alert("您没有做任何修改哦。。");
		}
		$.post('/update', {nickname: nickname, sign: sign}, function(data, status){
			if (data.flag == 1)
			{
				preNickname = nickname;
				preSign = sign;
				return alert("修改成功！");;
			}
			if (data.flag == 2 )
			{
				return alert("系统繁忙,请稍后重试!");
			}

		});
	});

	window.imgforbase64 = function(str, name) {
		var id = 'J_preview';
		var ext = name.substring(name.lastIndexOf('.') + 1, name.length);
		var img;
		img = document.getElementById(id);
		img.src = 'data:image/' + ext + ';base64,' + str;
        var small_img = document.getElementById('J_small');
		small_img.src = img.src;
		$('#J_avatar').val(img.src);
	};

	swfobject.embedSWF('/javascripts/imgforbase64.swf', 'avatar', "50", "25", '9.0.0', 'http://www.adobe.com/cfusion/knowledgebase/index.cfm?id=6a253b75', {
		width: 170,
		height: 170,
		outwidth: 200,
		outheight: 200
	},
	{
		loop: false,
		menu: false,
		allowScriptAccess: 'always',
		allowFullScreen: 'false',
		quality: 'best',
		bgcolor: '#fff',
		wmode: 'transparent'
	});
    
	var preAvatar = $('#J_avatar').val().trim();
	$('#avatarUpload').submit(function(){
		var avatar = $('#J_avatar').val().trim();
		if (avatar == preAvatar)
		{
			alert("您没有更换头像哦");
			return false;
		}
		
        var action = $(this).attr('action');
        $.post(action, {avatar: avatar}, function(data){
			if (data.flag == 1)
			{
				alert("请先登录");
				return false; 
			}
			if (data.flag == 2)
			{
				alert("系统繁忙,请稍后重试!");
				return false;
			}
			if (data.flag == 3)
			{
				var current_img = document.getElementById('J_current');
		        current_img.src = avatar;
				preAvatar = avatar;
				alert("头像修改成功！");
				return false;
			}
        });
        return false;
    });
  

});