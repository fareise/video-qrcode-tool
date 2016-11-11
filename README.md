# video-qrcode-tool
video transfer and qrcode format
＃一、	二维码生成工具

＃1.短链接服务
服务接口：192.168.252.8/users/shorten
需要数据：text ->原url
返回数据：text ->原url; shourl -> 短url
数据类型：json
传递方式：POST
使用示例：
$.ajax({
	url: "192.168.252.8/users/shorten",
	dataType: "json",
	type: "POST",
	data: sho,
	success: function(data){
		console.log(data.text);
		console.log(data.shourl);
	},
	error: function(data, msg){
		console.log(msg);
	}
})

＃2.二维码生成服务
服务接口：192.168.252.8/users/qr
需要数据：text -> url; width -> 二维码宽高
返回数据：url ->生成图像的data url; width -> 二维码宽高
数据类型：json
传递方式：POST
使用示例：
$.ajax({
	url: "/users/qr",
	dataType: "json",
	type: "POST",
	data: qrneed,
	success: function(data){
		var qrcode = document.getElementById("qrcode");
		qrcode.src = data.url;
		qrcode.width = data.width;
		qrcode.height = data.width;
		$("#saveImg")[0].href=data.url ;
	},
	error: function(data, msg){
		console.log(msg);
	}
}) 




＃二、	视频转码工具

服务接口：192.168.252.8/users/formup

需要数据：width->视频高度; height->视频宽度; fps->视频帧率; kbps->视频码率;
format->要转换的格式; save->文件名; testfile->视频文件

返回数据：如果视频长度超过要求、没有上传视频等，会直接返回提示信息；如果视频转码成功，会返回文件管理服务器上的视频url地址

使用说明：指定from表单的enctype="multipart/form-data"，使用ajax调用接口时，需要使用FormData()对象
使用示例：
sub.onclick = function(){
	var mainv = document.getElementById("mainv");
	var all = new FormData(mainv);
	$.ajax({
		url: "/users/formup",
		type: "POST",
		data: all,
		processData: false,
		contentType: false,
		success: function(data){
			aler.innerHTML = data;
		},
		error: function(data, msg){
			aler.innerHTML = msg + " : " + data;
		}
	})
}

