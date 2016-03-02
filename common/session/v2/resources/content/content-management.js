var $		= require('jquery-deferred');
var content_api = require('./content-api');
var content = {};
/*
 * Initialization
 */ 
content.init = function (info, log){
	log.info('NEW CM INIT, ', info.custom.content_api);
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
			console.log('>>>>>>>>>>>>>: ', result);
			_d.resolve(result);
		},
		function (err){
			_d.reject(err);
		}
	);
	return _d.promise();
};
module.exports = content;
