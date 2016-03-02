var $		= require('jquery-deferred');
var content_api = require('./content-api');
var content = {};
var log;
/*
 * Initialization
 */ 
content.init = function (info, log_){
	log = log_;
	content_api.init(info, log_);
};
/*
 *	Method make request to api to get temporary url for upload
 */ 
content.get_temporaryurl = function(info){
	var _d = $.Deferred();

	content_api.get_presigned_url (info)
		.then (
			function(result) {
				_d.resolve (result);
			},
			function (err) {
				_d.reject (err);
			}
		);

	return _d.promise();
};
/*
 *	Method to get all content against userid
 *
 */ 
content.get_content_list = function(user_id){
	var _d = $.Deferred();
	content_api.get_content_list(user_id)
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
content.add_content_info = function(info){
	var _d = $.Deferred();
	content_api.update_on_conversion(info)
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
