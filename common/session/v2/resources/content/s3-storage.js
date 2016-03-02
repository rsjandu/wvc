var $      	= require('jquery-deferred');
var aws         = require('aws-sdk');

var s3_communication = {};

var S3_BUCKET;
var KEY_NAME;
var CONTENT_URL;
var EXPIRE_TIMESTAMP;
var log;
s3_communication.init = function(startupInfo,logs){
	log = logs;
	var AWS_ACCESS_KEY = startupInfo.custom.s3_access_key;
	var AWS_SECRET_KEY = startupInfo.custom.s3_secret_key;	
	S3_BUCKET = startupInfo.custom.bucket_name;
	CONTENT_URL = startupInfo.custom.s3_content_url;
	KEY_NAME = startupInfo.custom.s3_key_name;
	EXPIRE_TIMESTAMP = startupInfo.custom.sessionduration;
	aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
};
/* Method used to get the pre_signed url which will expire after given time.
 *  @parameter : information of file to upload i.e. file_name and file_type
 *  It will return object and which contains the pre_signed url to upload file. 
 */
s3_communication.get_presigned_url = function(info){
	var _d = $.Deferred();
	var s3 = new aws.S3();
	var s3_params = {
		Bucket: S3_BUCKET,
		Key: KEY_NAME+'/'+info.file_name,
		Expires: EXPIRE_TIMESTAMP,
		ContentType: info.file_type,
		ACL: 'public-read'
	};
	s3.getSignedUrl('putObject', s3_params, function(err, data){
		if(err){
			_d.reject('Error pre-signed url, '+err);
		}
		else{
			var return_data =
				{
					signed_request: data,
					url: CONTENT_URL+info.file_name,
					file_name: info.file_name
				};
				_d.resolve(return_data);
		}
	});
	return _d.promise();
};
/**
 *	Method used to list all the objects inside the bucket
 */ 
s3_communication.get_allobjects = function(marker){
	var _d = $.Deferred();
	var s3 = new aws.S3();
	var params = {
		Bucket: S3_BUCKET,
		Marker: marker
	};
	s3.listObjects(params, function(err, data) {
		if (err) _d.reject(err);
		else _d.resolve(data);
	});
	return _d.promise();
};
/*
 *Method used to delete content from bucket
 */ 
s3_communication.delete_object = function (file_name){
	var _d = $.Deferred();
	var s3 = new aws.S3();
	var params = {
		Bucket: S3_BUCKET ,
		Key: KEY_NAME+'/'+file_name
	};
	s3.deleteObject(params, function(err, data) {
		if (err) _d.reject(err);
		else _d.resolve(data);    
	});
	return _d.promise();
};
module.exports = s3_communication;


