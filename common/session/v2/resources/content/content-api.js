var $           = require('jquery-deferred');
var rest        = require('restler');
var api_url;
var content_api = {};
var log;
/*
 *	Initialize method
 */ 
content_api.init = function (info, log_){
	log = log_.child ({ 'resource-section' : 'content-api' });
	api_url = info.custom.content_server;
};
/*
 *	Method to get temporary url to upload content.
 */ 
content_api.get_presigned_url  = function (info) {
	var _d =  $.Deferred();
	var data = {
		dir	 : info.dir,
		name : info.file_name,
		type : info.file_type,
		flag : info.flag
	};

	if (!info.user_id || !info.file_name || !info.file_type) {
		_d.reject ('some mandatory parameters not specified');
		return _d.promise ();
	}

	var request_url = api_url + "content/v1/user/" + info.user_id + "/add";

	log.debug ({ info: info }, 'in get_presigned_url');

	var _r = rest.post (request_url,{
		headers : {'Content-Type':'application/json'},
		data    : JSON.stringify(data) 
	});

	_r.on ('complete', function(result, response) {

		log.info ({ result: result }, 'post complete');

		if (result.status === 'error') {
			_d.reject(result);
		} else {
			_d.resolve(result);
		}
	});

	_r.on ('error', function (err, response) {
		log.error ({ err: err }, 'post error');
		_d.reject (err);
	});

	_r.on ('timeout', function (ms) {
		log.error ({ ms: ms }, 'post timedout');
		_d.reject (ms);
	});

	return _d.promise();
};
/*
 *	Method to get all content of user.
 */ 
content_api.get_past_content_list = function ( info ) {
	var _d = $.Deferred();

	if ( !info.user_id ) {
		_d.reject ('Mandatory parameter user_id not specified');
		return _d.promise ();
	}

	var request_url = api_url+"content/v1/user/"+ info.user_id+"/list";
	var _r = rest.get(request_url,{

	});

	_r.on('complete',function(data,response){
		log.info( { data : data }, 'post complete.');
		if(data.status === 'error'){
			_d.reject(data);
		}else{
			_d.resolve(data);
		}
	});

	_r.on ('error', function (err, response) {
		log.error ({ err: err }, 'post error');
		_d.reject (err);
	});

	_r.on ('timeout', function (ms) {
		log.error ({ ms: ms }, 'post timedout');
		_d.reject (ms);
	});
	return _d.promise();
};
/*
 *	Method to update the status of content after conversion
 */ 
content_api.addinfo_to_contentserver = function(info){

	var _d =  $.Deferred();

	if (!info.user_id || !info.file_name || !info.type || !info.file_org_name || !info.file_size || !info.converted_url) {
	 	_d.reject ('some mandatory parameters not specified');
	        return _d.promise ();
	}

	var data = {
			user_id	: info.user_id,
		    	dir	: info.dir,	
			name 	: info.file_name, 
			org_name: info.file_org_name,
			type 	: info.type,
			size 	: Number(info.file_size),
			url  	: info.converted_url,
			tags 	: info.tags
		};

	var request_url = api_url+"content/v1/user/"+ data.user_id+"/added";
	var _r = rest.post(request_url,{
		headers : {'Content-Type':'application/json'},
		data    : JSON.stringify(data)
	});
	_r.on('complete',function(result, response){
		log.info( { result : result }, 'post complete.');
		if(result.status === 'error'){
			_d.reject(result);
		}else{
			_d.resolve(result);
		}
	});

	_r.on ('error', function (err, response) {
		log.error ({ err: err }, 'post error');
		_d.reject (err);
	});

	_r.on ('timeout', function (ms) {
		log.error ({ ms: ms }, 'post timedout');
		_d.reject (ms);
	});

	return _d.promise();
};
module.exports = content_api;
