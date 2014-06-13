// 检查用户名格式
function checkName(str) {
	if (str.length <3)
	{
		document.getElementById("username_msg").innerHTML = "亲，用户名怎么也得3个字符吧";
        return false;
	}
	else
	{
		document.getElementById("username_msg").innerHTML = "";
        return true;
	}
};

// 检查邮箱格式
function checkEmail(str) {
	if (!str.match(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/))
	{
		document.getElementById("email_msg").innerHTML = "邮箱格式不正确";
        return false;
	}
	else
	{
		document.getElementById("email_msg").innerHTML = "";
        return true;
	}
};

// 检查密码格式
function checkPwd(str) {
	if (str.length <3)
	{
		document.getElementById("password_msg").innerHTML = "用户密码不能少于3个字符哦";
        return false;
	}
	else
	{
		document.getElementById("password_msg").innerHTML = "";
        return true;
	}
};

// 检查两次输入的密码是否一致
function checkSame(str) {
	var password = $("#pwd").val();
	if (str != password)
	{
		
		document.getElementById("repeat_msg").innerHTML = "两次输入的密码不一致";
        return false;
	}
	else
	{
		document.getElementById("repeat_msg").innerHTML = "";
        return true;
	}
};

// $.post
$(document).ready(function(){
	$("#btn_register").click(function(){
		var username = $("#nickname").val();
		var email = $("#email").val();
	    var password = $("#pwd").val();
	    var repeat_pwd = $("#pwd").val();
		if (checkName(username) && checkEmail(email) && checkPwd(password) && checkSame(repeat_pwd))
		{
			$.post('/reg', {username: username, password: password, email: email}, function(data, status){
				if (data.flag == 1)
				{
					document.getElementById("username_msg").innerHTML = "用户名已经存在";
					return;
				}
				if (data.flag == 2 )
				{
					alert("系统繁忙,请稍后重试!");
					return;
				}
				if (data.flag == 3)
				{
					document.getElementById("email_msg").innerHTML = "该邮箱已经被注册";
					return;
				}
				alert('注册成功');
				window.location.href = '/';
		
			});

		}
		else
			return;
	});
});
