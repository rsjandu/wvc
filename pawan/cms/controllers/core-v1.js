
var log		= require('common/log')  ,
	content = require('core/content')  ;

var core = {};

core.add = function( req, res, next){
	/* parse body and get values */

	var info = {};
	info.dir	= req.body.dir ,
	info.name	= req.body.name ,
	info.flags	= req.body.flags ,
	info.email	= req.email  ,
	info.store	= req.store  ;

	log.info( JSON.stringify(info));
	
	content.upload( info, function( url, err){
		if( err){
			res.send('error');
			return ;
		}
		res.send(url);
	});
};

core.added = function( req, res, next){
	var info = req.body;
	info.id = req.email;
	info.store = req.store;
	log.debug('core.added called INFO::' + JSON.stringify(info));

	content.added(info,function(err){
		if(err){
			res.send(err);
			return ;
		}
		res.send('success');
	});
}

core.list = function( req, res, next){
	var info	= {} ;

	info.email	= req.email;
	info.store	= req.store;
	info.dir	= req.query.dir;
	
	log.info('email: '+ info.email + ' parent:' + info.dir);
	content.list( info, function( err, list){
		if( err){
			res.send( err);
			return;
		}
		res.send(list);
	});
};

core.remove = function( req, res, next){
	res.send('not_implemented_yet')
}

core.update = function( req, res, next){
	res.send('not_implemented_yet')
}

module.exports = core;
