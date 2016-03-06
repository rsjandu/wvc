var $     = require ('jquery-deferred');
var rest  = require ('restler');
var crypt = require ('../../crypt');

var view_api;
var api_token;
var thumbnails_dimensions;
var content_info = {};
var log;
var conversion = {};

/*
 * Initalize method
 */ 
conversion.init = function (startupInfo, log_) {
	try {
		api_token = crypt.decipher (startupInfo.custom.api_token_encrypted, 'boxview');
	}
	catch (e) {
		log_.error ({ err : e, cipher: startupInfo.custom.api_token_encrypted, method : 'conversion.init' }, 'API Key Decryption failed');
		return false;
	}

	view_api = startupInfo.custom.view_api;

	/* comes in string where dimensions are separted by comma.*/
	thumbnails_dimensions = startupInfo.custom.thumbnails_dimensions; 
	log = log_;

	return true;
};

/*
 * Method used to start the conversion process using box api 
 * param info.
 * 	mandatory fileds are file_url and file_name.
 *
 */
conversion.start = function(info){
	var _df = $.Deferred();

	if (!info.access_url || !info.file_name) {
		log.error({url : info.access_url, name: info.file_name }, 'Content conversion');
		_d.reject ('some mandatory parameters not specified');
		return _d.promise ();
	}

	//store_contentinfo (info, start_time);

	conversion_start(info.access_url,info.file_name)
		.then(
			conversion_success.bind(_df),
			conversion_failure.bind(_df),
			conversion_inprogress.bind(_df)
		);
	return _df.promise();
};
/*Method call to initiate the conversion process.
 *
 * this method calls the box api using restler.
 */
function conversion_start (file_url, file_name)
{
	var _d = $.Deferred();
	var _r = rest.post (view_api + 'documents', {
		headers : { 
			Authorization: api_token, 
			'Content-Type':'application/json'
		},
		data    : JSON.stringify ({ url	: file_url, name : file_name, thumbnails : thumbnails_dimensions })
	});

	_r.on ('complete', function(data, response) {

		if (data.type !== 'error'){

			log.info ({ data: data, status_code :response.statusCode, file_name : file_name }, 'Conversion Start.');
			if ( data.status === 'done'){
				_d.resolve(data);
			} else if ( data.status === 'error'){
				_d.reject(data);
			} else {
				_d.notify(data);
			}

		} else {

			log.error ({ data: data, status_code :response.statusCode, file_name : file_name }, 'Conversion Start Error');
			if (response.statusCode === 429) {
				var err_obj = {
					retry_after : response.headers['retry-after'],
					status_code : response.statusCode,
					file_name   : file_name
				};
				_d.reject(err_obj);
			} else {
				_d.reject(response.statusCode);
			}
		}	
	});

	_r.on ('error', function (err, response) {
		log.error ({ err: err }, 'post error');
	});

	_r.on ('timeout', function (ms) {
		log.error ({ ms: ms }, 'post timedout');
		_d.reject (ms);
	});

	return _d.promise();
}
/* 	When conversion is in processing state, 
 *	we again call api method to get status of conversion.
 */
function getstatus_ontimeinterval (id) {
	get_conversion_status (id)
	.then(
		conversion_success.bind(this),
		conversion_failure.bind(this),
		conversion_inprogress.bind(this)
	);
}

/* 
 * Method called when content is in progress state.
 */
function conversion_inprogress (data) {

	setTimeout( getstatus_ontimeinterval.bind(this), 6000, data.id);

}

/*
 *  Method called after specific time interval to get the status to conversion
 */
function get_conversion_status(docID)
{
	var _d = $.Deferred();

	var _r = rest.get ( view_api+'documents/'+docID, {
		headers :{Authorization: api_token, 'Content-Type':'application/json'},
	});

	_r.on('complete', function (data,response) {

		log.info ({ name: data.name, progress: data.status, id: data.id, status_code : response.statusCode },  ' Conversion progress....');
		if ( data.id !== undefined ){

			if ( data.status === 'done' ){
				_d.resolve(data);
			} 
			else if ( data.status === 'error' ){
				_d.reject(data);
			} 
			else {
				_d.notify(data);
			}				
		}
		else{
			_d.reject(data);
		}
	});

	_r.on ('error', function (err, response) {
		log.error ({ err: err }, 'post error');
	});

	_r.on ('timeout', function (ms) {
		log.error ({ ms: ms }, 'post timedout');
		_d.reject (ms);
	});
	return _d.promise();
}

/*
 * Method called on successfull conversion
 */
function conversion_success(result)
{
	this.resolve ( result );

}

/* 
 * Method will called when conversion failed.
 */
function conversion_failure(err)
{
	this.reject(err);
}


module.exports= conversion;

