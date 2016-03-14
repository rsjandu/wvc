var $ 			    = require('jquery-deferred');
var conversion 		    = require('./conversion');
var content_management 	    = require('./content-management');

var content_list = {};
var log;
var coms;
var bucket_url;
var content = {};

content.init = function (myinfo, common, handles) {
	var _d = $.Deferred ();

	log = handles.log;
	coms = handles.coms;
	bucket_url = myinfo.custom.s3_bucket_url;
	if (!conversion.init (myinfo, log)) {
		_d.reject ('conversion init failed');
		return _d.promise ();
	}
	log.info('Content module init.');
	content_management.init (myinfo,log);

	_d.resolve ();
	return _d.promise ();
};

content.init_user = function (user) {
	log.info ('Content management:-> init_user'); 
	var _d = $.Deferred ();

	_d.resolve ({
		background : 'white'
	});

	return _d.promise ();
};

content.command = function (vc_id, command, data) {
	var _d = $.Deferred ();

	switch (command) {

		case 'get-tmp-url' : 
			log.info ({ command: command, data:data }, 'rx Command');
			get_presigned_url (_d, data);
			break;
		case 'upload_complete': 
			log.info ({ command: command, data:data }, 'rx Command');
			addinfo_to_contentserver (_d, data);
			break;

		case 'start-conversion' :
			log.info ({ command: command, data:data }, 'rx Command');
			send_file_to_conversion (_d, data);
			break;

		case 'get-content' :
			log.info ({ command: command, data:data }, 'rx Command');
			get_past_content_list ( _d, data );
			break;

		default :
			_d.reject ('unknown command "' + command + '"');
	}

	return _d.promise ();
};

content.info = function (from, id, info) {
	coms.broadcast_info (id, info, from);
};


/* Method called from client to get the temporary url to upload file.*/
function get_presigned_url (_d, info) {
	content_management.get_presigned_url (info)
	.then (
		function (result) {
			_d.resolve (result.data);
		},
		_d.reject.bind(_d)
	);
}
/*
 *	Method to get past uploaded content.
 *	param: userid, dir(optional)
 */ 
function get_past_content_list ( _d , data ) {

	content_management.get_past_content_list(data)
	.then(
		_d.resolve.bind(_d),
		_d.reject.bind(_d)
	);
}

/* 
 *	Method used to send file to box conversion
 */
function send_file_to_conversion (_d, info) {

	if ( !info.name || !info.path || !info.type || !info.size || !info.url || !info.user_id  ) {
		log.error({ info: info }, 'Mandatory parameters for conversion not specified');
		_d.reject ('Mandatory parameters for conversion not specified');
		return;
	}

	var d = new Date();
	info.conv_time = d.getTime();
	conversion.start (info)
		.then(
			conversion_success_handler.bind (null, _d, info),
			conversion_failure_handler.bind (_d)
		);
}
/*
 * Method called on conversion success.
 */
function conversion_success_handler (_d, info , result) {

	var d = new Date();
	info.conv_time = (d.getTime() - info.conv_time)/1000;
	info.converted_url = bucket_url+result.id;
	info.thumbnail_url = bucket_url+result.id+"/thumbnail-300x300.png"; 

	log.info ({ info: info }, ' <- Conversion complete ->');
	addinfo_to_contentserver (_d, info);
	_d.resolve (info);
}

/*
 *	Method send information to content server after succesfull convesion.
 */
function addinfo_to_contentserver (_d , info){
	content_management.addinfo_to_contentserver ( info )
	.then(
		function (result) {
			log.info ({ result : result }, ' <- ADDED TO SERVER->');
		},
		function (err) {
			log.error ({ err : err }, ' <- ERROR ADDED TO SERVER ->');
		}

	);
}

/*
 * Method called on conversion failure.
 * If 
 * 	there is request throttling error then same item send for conversion again
 * else
 * 	
 */ 
function conversion_failure_handler (error){

	log.error ( { error: error }, 'Conversion error.');

	this.reject(error);
}


module.exports = content;
