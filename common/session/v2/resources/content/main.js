var $ 			= require('jquery-deferred');
var conversion 		= require('./conversion');
var queue 		= require('./queue-conversion');
var content_management 	= require('./content-management');

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
			log.info ({ vc_id : vc_id, command: command, data:data }, 'rx Command');
			get_presigned_url (_d, data);
			break;

		case 'content_conversion' :
			log.info ({ command: command, data:data }, 'rx Command');
			send_file_to_conversion (_d, data);
			break;

		case 'get_all_content' :
			log.info ({ command: command, data:data }, 'rx Command');
			get_past_content_list ( _d, data );
			break;

		default :
			_d.reject ('unknown command "' + command + '"');
			return _d.promise();
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
				var data = {
					access_url : result.data.access_url,
					file_name  : result.data.filename,
					status     : "get_temp_url"
				};
				content_list[result.data.filename] = data;

				_d.resolve ({ upload_url: result.data.upload_url, file_name: result.data.filename });	
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

	if ( !info.file_name ) {

		log.error({ name: info.file_name, url : info.access_url}, ' Send file to coversion.');
		_d.reject ('Mandatory parameters for conversion not specified.');
		return  _d.promise ();

	}

	var content_info = update_contentinfo(info); // check for undefined.

	if (content_info === undefined ) {

		log.error({ content_info : content_info}, ' Send file to coversion.');
		_d.reject ('Unable to store content information.');
		return _d.promise ();
	}
	/* Start conversion process */
	var data = {
		file_name   :  content_info.file_name,
	        access_url  :  content_info.access_url,
	};
	conversion.start (data)
	 	.then(
			conversion_success_handler.bind (_d),
			conversion_failure_handler.bind (_d)
		);
}

/*
 *
 * Method called on conversion success.
 * Also pick next item from queue and send for conversion.
 */
function conversion_success_handler (result) {

	log.info ({ result : result }, ' <- Conversion complete ->');

	/* update the list info  */
	if (content_list [result.name] !== undefined) {
		var data = content_list [ result.name ];

		data.status = "conversion_complete";
		data.converted_url = bucket_url+result.id;

		content_list [result.name] = data; /* Add info of coverted content in local list */
		
		addinfo_to_contentserver(this,  content_list [result.name]);
		this.resolve (result);
	}
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
function conversion_failure_handler(error){

	log.error ( { error: error }, 'Conversion error.');
	this.reject(error);
}

/*
 *  UPDATE uploaded content info in list.
 */
function update_contentinfo(info){
	if( content_list [info.file_name] !== undefined ){
		var data = content_list[info.file_name];

		data.vc_id         = info.vc_id;
		data.file_org_name = info.file_org_name;
		data.status        = "upload_complete";
		data.user_id       = info.user_id;
		data.file_size	   = info.file_size;
		data.type  	   = info.type;
		data.dir           = info.dir;
		data.tags	   = info.tags;

		content_list[info.file_name] = data;
		return data;
	}	
}

module.exports = content;
