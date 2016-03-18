
var log 		= require('common/log')  ,
	nodes		= require('core/nodes')  ,
	storage_if	= require('core/storage-if')  ;

var content = {};

content.upload = function( info, cb){

		storage_if.call( 'get_upload_url', info, function( err, url){
						log.info('err::' + err + ' url::' + JSON.stringify( url) );
						if( cb){
							 err ? cb( err) :	cb( null, url);
						}
						/* no need to store it, we keep our server stateless */
					});
};

/* -----------------------------------------------------------------------------*
 |  NOTE : for duplicate file upload requests we just overwrite the old ones	|
 |			S3 automatically deletes prev file when we upload a duplicate file	*----------------------------------*
 |			and we(in the local db) just replace the access urls etc. whenever they say duplicate content is added |
 * ----------------------------------------------------------------------------------------------------------------*/

content.added = function( info, cb){
	//info.path = info.path;

	var options = {};
	options.uid	  =	info.uid;		// wiil not pass user info like this once user handling is done
	info.expiry = info.removeafter ? Date.now() + info.removeafter*1000 : info.removeafter;

	options.node  =	{
				owner	:	info.uid,	
				name	:	info.name,	
				path	:	info.path,	
				store	:	info.store,
				url	 	:	info.url,
				type	:	info.type,	
				size	:	info.size,	
				status	: 	info.status,
				tags	:	info.tags,
				expiry	:	info.expiry,
				thumbnail:	info.thumbnail
	};	
	log.debug( 'content to be added::'+ JSON.stringify(options));

	nodes.get_node( options.node, function( node){
		log.debug(' node search returned:: ' + node);
		if(node){
			nodes.replace( options.node, function( err){
				cb(err);
			});
		}
		else{
			nodes.add( options,function(err){
				cb(err);		//	__iska error is important
			});
		}
	});
};

content.list = function(info , cb){			// info ==> uid path store
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

content.remove = function( info, cb){		// info ==> uid path store
	/* 
	 *  check: if present, can delete etc.
	 *	delete from store
	 *	and remove from db ( 'users' as well as 'nodes' )
	 */
	nodes.get_node( info, function( node){
		if( !node){
			cb('NODE_RM_ERROR: Does not exist');
			return;
		}
		// some info needed for delete will be added to 'info', here
		storage_if.call( 'remove', info, function(err, msg){
			if( err){
				cb(err);
				return;
			}
			log.debug('message from st_if::'+ msg); 	// remove the arg as well with this stmt.
			nodes.remove( info, cb);
		});
	});
};

module.exports = content;
