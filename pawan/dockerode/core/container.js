var Docker	= require('dockerode') ,
	config	= require('common/config') ,
	log		= require('common/log') ;


var docker = new Docker();  //{socketPath: '/var/run/docker.sock'});

var image		= config.image ,
	port		= config.internal_port ,
	host_dir	= config.session_dir ,
	mount_name	= config.mount_name ;

function create( info, cb){
	info = info || {};
	docker.createContainer({ 
		name	: info.name,
		tty		: true,
		publish	: port,
		Image	: image,
//	   	Volume	:{ host_dir : mount_name}
	}, cb);									// cb( err, container)
}
		
function attach( container, cb){
	container.attach({
		stream: true, 
		stdout: true,
		stderr: true
	}, cb);									// cb( err, stream)
	//stream.pipe( process.stdout);
}
				
function start( container, cb){
	log.debug('Binds: ' + host_dir + ":" + mount_name );
	container.start({
	   "Binds":[ host_dir + ":"+ mount_name]
	}, cb);									// cb( err, data)
}

function fire( cb){
	cb = cb || function(){};
	create({ name: 'temp'}, function(err, container){
		log.info({ err: err, container: container}, 'created container');
		if( err){
			return cb(err);
		}
		attach( container, function( err, stream){
			log.info({ err: err, stream: 'skipping print'}, 'attached container');
			if( err){
				return cb(err);
			}
			stream.pipe( process.stdout);
			start( container, function( err, data){
				log.info({ err: err, data: data}, 'started container');
				if( err){
					return cb(err);
				}
				cb('hogya');
			});
		});		
	});
}

module.exports = { 
	fire : fire
};
