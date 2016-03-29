/* 
 *	get documents which are expired
 *	delete from store
 *	remove from local db
 *			__do that every <some> minutes
 * */

var config	= require('common/config') ,
	log		= require('common/log') ,
	content	= require('core/content') ,
	nodes	= require('core/nodes') ;

setInterval( sweep, config.deamon.freq * 100 * 60 );		// change it to minutes //

function sweep(){
	nodes.get_expired( function( err, data){
		data = data || [];
		console.log( 'expired fields: ' + data.length);
		data.forEach( function( node){
			content.remove({
				uid : node.owner,
				path : node.path,
				store : node.store
			}, function( err, data){
				log.info({ err : err, data : data }, 'auto purge' );
			});
		});
	});
}
