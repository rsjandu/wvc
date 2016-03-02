var $		= require('jquery-deferred');
var content_api = require('./content-api');
var content = {};
/*
 * Initialization
 */ 
content.init = function (info, log){
	content_api.init(info);
};
/*
 *	Method make request to api to get temporary url for upload
 */ 
content.get_temporaryurl = function(info){
	var _d = $.Deferred();
	content_api.get_presigned_url(info)
	.then(
		function(result){
			_d.resolve(result);
		},
		function (err){
			_d.reject(err);
		}
	);
	return _d.promise();
};
/*
 *	Method to get all content against userid
 *
 */ 
content.get_content_list = function(info){
	var _d = $.Deferred();
	content_api.get_content_list(info)
	.then(
		function(result){
			_d.resolve(result);
		},
		function (err){
			_d.reject(err);
		}
	);
	return _d.promise();
};
/*
 *	Method to add user content to content library.
 */
content.addcontent = function(info){
	var _d = $.Deferred();
	content_api.update_contentstatus(info)
	.then(
		function(result){
			_d.resolve(result);
		},                  
		function (err){
			_d.reject(err);
		}
	);
	return _d.promise();
};
module.exports = content;
