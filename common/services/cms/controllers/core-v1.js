var log		= require('common/log')  ,
	content = require('core/content')  ;

var core = {};

core.add = function( req, res, next){
	/* parse body and get values */

	var info = {};
	info.dir	= req.body.dir || '/',
	info.name	= req.body.name ,
	info.type	= req.body.type ,
	info.flags	= req.body.flags || {} ,
	info.uid	= req.email  ,
	info.store	= req.store  ;

	if( !info.name || !info.type ){
		res.send( 'some fields are required..please consult api docs');
		return;
	}

	log.info({ info: info }, 'add');
	
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
	info.dir	= req.query.dir;
	
	log.info('email: '+ info.uid + ' parent:' + info.dir);
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
