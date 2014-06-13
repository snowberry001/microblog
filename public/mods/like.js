
$(document).ready(function(){
 
	$(".ilike").click(function(){
		var post_id = $(this).attr("id");
		var newNum = parseInt($(this).attr("number")) + 1;
		$.post('/dolike', {post_id: post_id}, function(data, status){
			if (data.flag == 1)
			{
				return alert('您还没有登录');
				
			}
			if (data.flag == 2 )
			{
				return alert("系统繁忙,请稍后重试!");
				
			}
			if (data.flag == 4)
			{
				return alert("您已经喜欢了这条微博", "warning");
			}
			if (data.flag == 3)
			{    
				
				alert("成功加入喜欢");
				document.getElementById(post_id).innerHTML = "<img src='/img/good.gif' /> 喜欢(" + newNum + ")";
			}
		});	    
	});
});