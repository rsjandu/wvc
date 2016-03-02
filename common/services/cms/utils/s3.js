var $      	= require('jquery-deferred') ,
	aws     = require('aws-sdk') ,
	log		= require('common/log') ,
	config	= require('common/config') ;

var s3 = {};

var AWS_ACCESS_KEY	= config.s3.key ,
	AWS_SECRET_KEY	= config.s3.secret ,
	S3_BUCKET		= config.s3.bucket ,
	KEY_NAME		= config.s3.dir ;

var CONTENT_URL;
var EXPIRE_TIMESTAMP = 2000;

aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
var _s3 = new aws.S3();

s3.get_upload_url = function(info){
	var _d 		= $.Deferred() ,
		params	= {
			Bucket: S3_BUCKET,
			Key: KEY_NAME+'/'+ info.dir + '/'+info.name,
			Expires: EXPIRE_TIMESTAMP,
			ContentType: info.type,
			ACL: 'public-read'
		} ;

	_s3.getSignedUrl('putObject', params, function(err, data){
			if(err){
				_d.reject(err);
			}
			else{
				_d.resolve({
					upload_url	: data,
					access_url	: CONTENT_URL+info.filename,
					filename	: info.name
				});
			}
		});
	return _d.promise();
};

module.exports = s3;

