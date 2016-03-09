
var log 		= require('common/log')  ,
	nodes		= require('core/nodes')  ,
	storage_if	= require('core/storage-if')  ;

var content = {};

content.upload = function( info, cb){

		storage_if.get_upload_url( 
					info, 
					function( err, url){
						log.info('err::' + err + ' url::' + JSON.stringify( url) );
						if( cb){
							 err ? cb( err) :	cb( null, url);
						}
						/* no need to store it, we keep our server stateless */
					});
	});
};

content.added = function( info, cb){
	info.path = info.path;

	var options = {};
	options.uid	  =	info.uid;		// wiil not pass user info like this once user handling is done
	options.node  =	{
				owner	:	info.uid,	
				name	:	info.name,	
				path	:	info.path,	
				url	 	:	info.url,
				type	:	info.type,	
				size	:	info.size,	
				status	: 	info.status,
				tags	:	info.tags
	};	
	
	log.debug( 'content to be added::'+ JSON.stringify(options));

	nodes.add( options,function(err){
		cb(err);		//	__iska error is important
	});

};

content.list = function(info , cb){			// info ==> uid email store
	/*
	 * different methods will be called 
	 * depending on which filter is to be used 
	 */
	if( info.path){
		nodes.get_by_path( info , cb);	
	}
	else{
		nodes.get( info.uid, cb);	
	}
};

content.remove = function(){
	log.info('content remove called');
};

module.exports = content;
