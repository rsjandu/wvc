
var log 		= require('common/log')  ,
	database	= require('models/user')  ,
	storage_if	= require('core/storage-if')  ;

var content = {};

content.upload = function( info, cb){

	/*
	 * check db 
	 * 	if _email+_dir+_fname exists then return error				__but this has pitfalls, one is say upload failed
	 * 	else return url	and maybe store this entry
	 * */
	storage_if.get_upload_url( 
					info.store , 
					info.name , 
					function( url, err){
						log.info('url::' + url);
						if( cb){
							 err ? cb( null, err) :	cb( url);
						}
						/* may need to store it to db */
					});
};

content.added = function( info, cb){
	info.status = 'uploaded';

	var options = {};
	options.uid	  =	info.id;
	options.nodes = [];					//	__will send info.node when user add is handled differently__
	options.nodes.push(	{	
				name	:	info.name,	
				dir		:	info.dir,	
				url	 	:	info.url,
				type	:	info.type,	
				size	:	info.size,	
				status	: 	info.status,
				tags	:	info.tags
	});	
	
	log.debug( 'content to be added::'+ JSON.stringify(options));

	database.add_node( options,function(err){
		cb(err);		//	__iska error is important
	});

};

content.list = function(info , cb){			// info ==> dir email store
	if( info.dir){
		database.get_by_dir( info , cb);	
	}
	else{
		database.get( info.email, cb);	
	}
};

content.remove = function(){
	log.info('content remove called');
};

module.exports = content;
