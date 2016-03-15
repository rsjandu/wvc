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
		var obj = {};
		obj.status = 'error';
		obj.data =  'some fields are required..please consult api docs';
		res.send( obj);
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
	var info = {};

	info.uid = req.email;
	info.store = req.store;
	info.path = req.query.path;
	
	log.info('info:' + JSON.stringify( info) );
	content.remove( info, function( err, message){
		var obj = {};
		if( err){
			obj.status = 'error';
			obj.data = err;
			res.send( obj);
			return;
		}
		obj.status = 'success';
		obj.data = message;
		res.send( obj);	
	});
}

core.update = function( req, res, next){
	res.send({'status':'error', 'data':'not_implemented_yet'});
}

module.exports = core;
