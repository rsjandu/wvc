
var log 		= require('common/log') ,
	storage_if	= require('core/storage-if')  ;

var content = {};

content.upload = function( info, cb){

	/*
	 * make a db entry 
	 *  this user + this file
	 * */
	storage_if.get_upload_url( 
					info.store , 
					info.f_name , 
					function( url, err){
						log.info('url::' + url);
						if( cb){
							 err ? cb( null, err) :	cb( url);
						}
						/* need to store it to db */
					});
};

content.remove = function(){
	log.info('content remove called');
};

module.exports = content;
