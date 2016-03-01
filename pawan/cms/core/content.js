
var log 		= require('common/log')  ,
	nodes		= require('core/nodes')  ,
	storage_if	= require('core/storage-if')  ;

var content = {};

content.upload = function( info, cb){

	/* 
	 * what if user requests for and gets 2 upload urls for the same file
	 * 		-- this can be avoided if we store this node to db, but then what happens if the upload fails
	 * 			-- maybe we will store a status of the request as well and return 
	 * 					the same url (if requested again) with some message which tells it is a duplicate request
	 *					OR
	 *					just an error and the same url if a force flag is used
	 * */

	nodes.get_node( info, function( node){
		if(node){
			cb( 'NODE_ADD_ERR: Already Exists');
			return;
		}

		storage_if.get_upload_url( 
					info.store , 
					info.name , 
					function( err, url){
						log.info('err::' + err + ' url::' + url);
						if( cb){
							 err ? cb( err) :	cb( null, url);
						}
						/* may need to store it to db */
					});
	});
};

content.added = function( info, cb){
	info.status = 'uploaded';

	var options = {};
	options.uid	  =	info.uid;		// wiil not pass user info like this once user handling is done
	options.node  =	{
				host	:	info.uid,	
				name	:	info.name,	
				dir		:	info.dir,	
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
	if( info.dir){
		nodes.get_by_dir( info , cb);	
	}
	else{
		nodes.get( info.uid, cb);	
	}
};

content.remove = function(){
	log.info('content remove called');
};

module.exports = content;
