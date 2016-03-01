
var log		= require('common/log')  ,
	content = require('core/content')  ;

var core = {};

core.add = function( req, res, next){
	/* parse body and get values */

	var info = {};
	info.dir	= req.body.dir ,
	info.name	= req.body.name ,
	info.flags	= req.body.flags || {} ,
	info.uid	= req.email  ,
	info.store	= req.store  ;

	if( !info.name || !info.dir ){
		res.send( 'some fields are required..please consult api docs');
		return;
	}

	log.info( JSON.stringify(info));
	
	content.upload( info, function( err, url){
		if( err){
			res.send('Error::' + err);
			return ;
		}
		res.send(url);
	});
};

core.added = function( req, res, next){
	var info = req.body;
	info.uid = req.email;
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

	info.uid	= req.email;
	info.store	= req.store;
	info.dir	= req.query.dir;
	
	log.info('email: '+ info.uid + ' parent:' + info.dir);
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
