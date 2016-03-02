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
	var d = new Date();
	var start_time = d.getTime();
	store_contentinfo(info,start_time);
	conversion_start(info.content_url,info.file_name)
	.then(
		conversion_success.bind(_df),
		conversion_failure.bind(_df),
		conversion_inprogress.bind(_df)
	);
	return _df.promise();
};
/*Method call to initiate the conversion process.
 *
 * this method call the box api using retler.
 */
function conversion_start(file_url, file_name)
{
	var _d = $.Deferred();
	rest.post(view_api+'documents',{
		headers :{Authorization: api_token, 'Content-Type':'application/json'},
		data    :JSON.stringify( { url	: file_url, name : file_name, thumbnails : thumbnails_dimensions })

	}).on('complete',function(data, response){
		if(data.type === 'error'){
			 log.error('CONVERSION Failure:<--> ', data, ' STATUS: ', response.headers['retry-after'],',name: ', file_name,' URL: ',file_url);
		}else{
			 log.info('CONVERSION START:--> ', data.type, ' STATUS: ', response.statusCode,',name: ', file_name,' URL: ',file_url);
		}
		if(data.type !== 'error'){
			if(data.status === 'done'){
				_d.resolve(data);
			}else if(data.status === 'error'){
				_d.reject(data);
			}else{
				_d.notify(data);
			}
		}else{
			if(response.statusCode === 429){
				var err_obj = {
					retry_after : response.headers['retry-after'],
					status_code : response.statusCode
				};
				_d.reject(err_obj);
			}else{
				_d.reject(response.statusCode);
			}
		}	
	});
	return _d.promise();
}
/* 	When conversion is in processing state, 
 *	we again call api method to get status of conversion.
 */
function getstatus_ontimeinterval(id){
	get_conversion_status(id)
	.then(
		conversion_success.bind(this),
		conversion_failure.bind(this),
		conversion_inprogress.bind(this)
	);
}
/* Method called when content is in progress state.*/
function conversion_inprogress(data){
	if(content_info[data.name] !== undefined){
		content_info[data.name].content_id = data.id;
		content_info[data.name].content_status = data.status;
		content_info[data.name].interval_id = setTimeout(getstatus_ontimeinterval.bind(this),6000,data.id);
	}
}

/* Method called after specific time interval to get the status to conversion*/
function get_conversion_status(docID)
{
	var _d = $.Deferred();
	rest.get(view_api+'documents/'+docID,{
		headers :{Authorization: api_token, 'Content-Type':'application/json'},
	}).on('complete', function(data,response){
		log.info('Conversion Progress: ',data.name,' ID:',data.id,' Status: ',data.status);
		if(data.id !== undefined){
			if(data.status === 'done'){
				_d.resolve(data);
			}else if(data.status === 'error'){
				_d.reject(data);
			}else{
				_d.notify(data);
			}				
		}
		else{
			_d.reject(data);
		}
	});
	return _d.promise();
}
/*Method called on successfull conversion*/
function conversion_success(val)
{
	var d = new Date();
	var end_time = d.getTime();
	if(val.id !== undefined){
		var create_final_object;
		if(content_info[val.name] !== undefined){
			var total_time = (end_time - content_info[val.name].start_time)/1000;
			clearInterval(content_info[val.name].interval_id);
			content_info[val.name].content_id = val.id;
			content_info[val.name].content_status = val.status;
			content_info[val.name].total_time = total_time;
			delete_contentinfo(val.name);
			create_final_object =  content_info[val.name];
			delete content_info[val.name];
		}
		this.resolve(create_final_object);
	}

}
/* Method will called when conversion failed.*/
function conversion_failure(err)
{
	this.reject(err);
}

/* Store content related information in object which will send when conversion complete.*/
function store_contentinfo(info,start_time){
	var data = {
		vc_id 		: info.vc_id,
		content_url	: info.content_url,
		file_name 	: info.file_name,
		file_org_name 	: info.file_org_name,
		start_time	: start_time
	};
	content_info[info.file_name] = data;
}
/*
 *	Method to delete object info
 */ 
function delete_contentinfo(name){
	if(content_info[name] !== undefined){
		delete content_info[name].start_time;
		delete content_info[name].interval_id;
		delete content_info[name].content_url;
	}
}

module.exports= conversion;

