var mongoose	= require('mongoose')  ,
	log			= require('common/log')  ,
	User		= require('models/user_model')  ;

var database = {};

database.add_node = function( info, cb){
	var _node = info.nodes[0];						/* will eventually be info.node */

	User.findOne({ uid: info.uid, 'nodes.dir': _node.dir, 'nodes.name' : _node.name}, function( err, user){
			log.debug( 'duplicacy check:  err::'+err);
			if( user){
				cb && cb( 'NODE_ADD_ERROR : already exists');
				return; 
			}
			else{
				User.findOne({ uid: info.uid}, 'quota nodes', function( err, user){
					if( !err && !user){					//			__temporarily, 	untill auth is not in place
						add_user( info, cb);			
						return ;
					}

					if( err){
						log.warn('is not supposed to happen.. unless it is a db error');
						cb && cb(err);
					}
					user.nodes.push( _node );			
					user.save( function( err, user){
						if( err){
							log.warn('db error::' + err);
							cb && cb(err);
							return;
						}
						log.info('saved::\n' + user);
						cb && cb() ;			
					});
				});
		 	}
	});
}

function add_user( info, cb){			/* will be handled differently */
	var user = new User(info);
	user.save( function( err, user){
		if(err){
			log.warn('db error::' + err);
			cb(err);
			return;
		}
		log.debug('added::\n' + user);
		cb && cb();
	});

};

database.get = function( id, cb){
	User.findOne({ uid: id}, function( err, user){
		if( err){
			cb(err);
			return;
		}
		console.log( JSON.stringify( user));
		cb( null, user);
	});
};

database.get_by_dir = function( info, cb){
	cb('_not_implemented_yet');
};

module.exports = database;


