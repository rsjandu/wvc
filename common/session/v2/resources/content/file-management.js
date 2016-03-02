var $ 			= require('jquery-deferred');
var s3_storage  	= require('./s3-storage');
var content_handler 	= {};

content_handler.init = function(startupInfo,logs){
	s3_storage.init(startupInfo, logs);
};

/* Method used to create temporary url for file storage */
content_handler.get_presigned_url = function(info){
	var _d =  $.Deferred();
	s3_storage.get_presigned_url(info)
	.then(
		function (data){
			_d.resolve(data);
		},
		function(data){
			_d.reject(data);
		}
	);
	return _d.promise();
};
/*
 *	Method delete the raw file from temporary storage.
 *	@parameter: file_name;
 */ 
content_handler.delete_object = function (file_name){
	var _d = $.Deferred();
	s3_storage.delete_object(file_name)
	.then(
		function(result){
			_d.resolve(result);
		},
		function(err){
			_d.reject(err);
		}
	);
	return _d.promise();
};
/*
 *
 */
content_handler.get_allobjects = function(){
        s3_storage.get_allobjects();
};

module.exports = content_handler;
