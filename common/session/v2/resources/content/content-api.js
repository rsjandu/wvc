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
	var request_url = api_url+"/";
	rest.post(request_url,{
		data    :JSON.stringify( { url  : file_url, name : file_name, thumbnails : thumbnails_dimensions })

	}).on('complete',function(data, response){
		if(data.type === 'error'){
			_d.reject(data);
		}else{
			_d.resolve(data);
		}

	});
	return _d.promise();
};
module.exports = content_api;

