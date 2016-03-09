
var log		= require('common/log')  ,
	content = require('core/content')  ;

var core = {};

core.add = function( req, res, next){
	/* parse body and get values */

	var info = {};
	info.path	= req.body.path ,
	info.name	= req.body.name ,	// _optional
	info.type	= req.body.type ,
//	info.flags	= req.body.flags || {} ,
	info.uid	= req.email  ,
	info.store	= req.store  ;

	if( !info.path || !info.type ){
		res.send( 'some fields are required..please consult api docs');
		return;
	}

	log.info( JSON.stringify(info));
	
	content.upload( info, function( err, url){
		var obj = {};
		if( err){
			obj.status = 'error';
			obj.data = err;
			res.send( obj);
			return ;
		}
		obj.status = 'success';
		obj.data = url;
		res.send( obj);
	});
};

core.added = function( req, res, next){
	var info = req.body;
	info.uid = req.email;
	info.store = req.store;

	log.debug('core.added called INFO::' + JSON.stringify(info));

	content.added(info,function(err){
		var obj = {};
		if(err){
			obj.status = 'error';
			obj.data = err;
			res.send( obj);
			return ;
		}
		obj.status = 'success';
		obj.data = {};
		res.send( obj);
	});
}

core.list = function( req, res, next){
	var info	= {} ;

	info.uid	= req.email;
	info.store	= req.store;
	info.path	= req.query.path;
	
	log.info('email: '+ info.uid + ' path:' + info.path);
	content.list( info, function( err, list){
		var obj = {};
		if( err){
			obj.status = 'error';
			obj.data = err;
			res.send( obj);
			return;
		}
		obj.status = 'success';
		obj.data = list;
		res.send( obj);
	});
};

core.remove = function( req, res, next){
	res.send('not_implemented_yet')
}

core.update = function( req, res, next){
	res.send('not_implemented_yet')
}

module.exports = core;
