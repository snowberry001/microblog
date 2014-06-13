$(document).ready(function(){
        var win_height = $(window).height();
	var doc_height = $(document).height();
	if(doc_height > win_height) {
		$("body").append("<div id='go_top' onClick='window.scrollTo(0,0);'></div>");
		$(window).scroll(function(){
			if($(window).scrollTop()>((doc_height-win_height)/4)) {
				$("#go_top").show();
			}
			else {
				$("#go_top").hide();
			}
		});
	}
});