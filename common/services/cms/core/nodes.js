var mongoose	= require('mongoose')  ,
	log			= require('common/log')  ,
	Node		= require('models/node') , 
	User		= require('models/user')  ;

var nodes = {};

nodes.add = function( info, cb){
	var	_ack	= ack.bind(null, cb)  ,
		_node	= info.node || info  ;	
	
	_node.owner = info.uid;

	get_node( _node, function( node){
		if( node){
			_ack('NODE_ADD_ERROR : already exists');
			return;
		}
		
		get_user( info, function( user){
			if( !user){
				_ack('USER_ERROR : not found');
				return;
			}
			
			var node = new Node( _node);
			log.debug('creating new node');
			node.save( function( err, node){
				log.debug(' done');
				if( err){
					_ack('IO_ERROR : could not save node');
					return;
				}
				user.nodes.push( node._id);
				//__change quota etc.
				user.save( function( err, user){
					log.debug(' user save done');
					if( err){
						_ack('IO_ERROR : could not save user');	
					}
					_ack(null);
				});
			});
		});	//get_user end
	});	//get_node end
};

nodes.get_node = get_node;

nodes.get = function( id, cb){			//there should be a similar method in user schema as well,  name being user.toJSON	
	Node.find({ 	
		'owner'	: id
	}, function( err, nodes){
		if( err){
			cb(err);
			return;
		}
		cb( null, nodes);
	});
};

nodes.get_by_dir = function( info, cb){
	log.debug(' get by dir : ' + info.dir);
	Node.find({ 
		'owner' : info.uid, 
		'dir' : new RegExp(info.dir,'i') 
	}, function( err, nodes){
		if( err){
			log.warn('get_by_dir db error: ' + err);
			cb && cb(err);
			return;
		}
		cb && cb( null, nodes);
	});
};

nodes.remove = function( _node, cb){
	/* remove from user as well */
/*	Node.findOne({
		'owner' : _node.owner,
		'dir'	: _node.dir,
		'name'	: _node.name,
		'type'	: _node.type
	}).remove().exec();
*/
};

/* -----------------
 *  private methods
 * ----------------- */

function ack( cb, err, data){
	log.info('ack called with err: ' + err + ' and data: ' + data);
	if( cb){
		cb( err, data);
	}
	return ;
}

function get_node( _node, cb){
	_node.owner = _node.owner || _node.uid;
	Node.findOne({ 
			'owner'	: _node.owner, 
			'dir'	: _node.dir, 
			'name'	: _node.name
	}, function( err, node){
			log.debug('get node done');
			if( err){
				log.warn('db_error_in get_node');
			}	
			cb && cb( node);
	});
}

function get_user( info, cb){
	User.findOne({ 
		'uid'	: info.uid
	}, 'quota nodes'
	 , function( err, user){
			log.debug('get user done');
			if( !err && !user){								//__special case, __temporary, until auth is implemented
				add_user( info, cb);			
				return ;
			}
			if( err){
				cb && cb(null);
				return;
			}
			cb( user);
	});
}

function add_user( info, cb){			/* will be handled differently */
	var user = new User(info);
	user.save( function( err, user){
		if(err){
			cb && cb(null);
			return;
		}
		log.debug('added::\n' + user);
		cb && cb( user);
	});
};

module.exports = nodes;