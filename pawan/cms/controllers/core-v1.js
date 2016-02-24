
var log		= require('common/log')  ,
	dir 	= require('core/dir')  ,
	content = require('core/content')  ;

var core = {};

core.dir_list 	= function( req, res, next){
	var store  = req.store  ,
		parent = req.dir_top  ;
	
	log.info('store: '+store + ' parent:' + parent);
	dir.list( store, parent, function( list){
		res.send(list);
	});
};

core.dir_create = function( req, res, next){
	var store 	= req.store  ,
		name	= req.dir ;

	dir.create( store, dir, function( err){
		if( err){
			res.send("couldn't create");
			return ;
		}
		res.send('success');
	});
};

core.dir_remove = dir.remove;

core.upload	= function( req, res, next){
	/* parse body and get values */

	var info = {};
	info.f_name	= req.body.filename ,
	info.dir	= req.body.dirname ,
	info.store	= req.store  ,
	info.uid	= '1123'  ;

	log.info( JSON.stringify(info));
	
	content.upload( info, function( url, err){
		if( err){
			res.send('error');
			return ;
		}
		res.send(url);
	});
};
core.remove = content.remove;


module.exports = core;
