var $ 			        = require('jquery-deferred');
var conversion 		    = require('./conversion');
var queue 		        = require('./queue-conversion');
var content_management 	= require('./content-management');

var log;
var coms;
var content = {};

content.init = function (myinfo, common, handles) {
	var _d = $.Deferred ();

	log = handles.log;
	coms = handles.coms;

	if (!conversion.init (myinfo, log)) {
		_d.reject ('conversion init failed');
		return _d.promise ();
	}

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
			log.info ({ vc_id : vc_id, command: command, data:data }, 'rx command');
			get_presigned_url (_d, data);
			break;

		case 'upload_content' :
			log.info ({ vc_id : vc_id, command: command, data:data }, 'rx command');
			if (queue.size()  === 0) {
				send_file_to_conversion (_d, data);
			}
			queue.add_item (data);
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

	content_management.get_temporaryurl (info)
		.then (
			_d.resolve.bind(_d),
			_d.reject.bind(_d)
		);
}

/* Method used to send file to box conversion*/
function send_file_to_conversion (_d, info) {
	conversion.start (info)
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
	queue.delete_item (); //remove item from queue after conversion.

	log.info ({ result : result }, ' < Conversion complete >');
	
	if(queue.size() > 0){
		send_file_to_conversion(queue.get_item());
	}
	this.resolve (result);
}
/*
 * Method called on conversion failure.
 * If 
 * 	there is request throttling error then same item send for conversion again
 * else
 * 	
 */ 
function conversion_failure_handler(error){
	if(error.retry_after !== undefined ){

		setTimeout (send_file_to_conversion, error.retry_after, queue.get_item());		
		log.error ( { error: error }, 'Conversion request throttling error.');

	}else{
		log.info ( { error : error }, 'Conversion complete');
		queue.delete_item (); //remove item from queue after conversion.
		this.reject (error);
	}
}

/*
 *	Method called to remove raw file from temporary storage.
 */
function delete_raw_file(file_name){
	file_manager.delete_object(file_name)
	.then(
		function (data){ 
			log.info('Raw file has been removed successfully');
		},
		function(data){
			log.error('Error while removing raw file from temporary storage.');
		}
	);
}
module.exports = content;
