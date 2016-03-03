var $           = require('jquery-deferred');
var rest        = require('restler');
var api_url;
var content_api = {};
/*
 *	Initialize method
 */ 
content_api.init = function (info){
	api_url = info.custom.content_api;
};
/*
 *	Method to get temporary url to upload content.
 */ 
content_api.get_presigned_url  = function (info){
	var _d =  $.Deferred();
	var data = {
		dir	: info.dir,
		name	: info.file_name,
		type	: info.file_type,
		flag	: info.flag
	};
	var request_url = api_url+"content/v1/user/"+ info.user_id+"/add";
	rest.post(request_url,{
		headers : {'Content-Type':'application/json'},
		data    : JSON.stringify(data) 
	}).on('complete',function(result, response){
		if(result.status === 'error'){
			_d.reject(result.message);
		}else{
			_d.resolve(result.data);
		}
	});
	return _d.promise();
};
/*
 *	Method to get all content of user.
 */ 
content_api.get_content_list = function(user_id){
	var _d = $.Deferred();
	var request_url = api_url+"content/v1/user/"+ user_id+"/list";
	rest.get(request_url,{
	}).on('complete',function(data,response){
		if(data.status === 'error'){
			_d.reject(data);
		}else{
			_d.resolve(data);
		}
	});
	return _d.promise();
};
/*
 *	Method to update the status of content after conversion
 */ 
content_api.update_on_conversion = function(info){
	var _d =  $.Deferred();
	var request_url = api_url+"content/v1/user/"+ info.user_id+"/added";
	rest.post(request_url,{
		headers : {'Content-Type':'application/json'},
		data    : JSON.stringify(info)
	}).on('complete',function(data, response){
		if(data.status === 'error'){
			_d.reject(data);
		}else{
			_d.resolve(data);
		}
	});
	return _d.promise();
};
module.exports = content_api;
