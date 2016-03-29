var Docker = require('dockerode') ;

var docker		= new Docker() ,
	image		= 'wiziq/session:v2.2',
	abs_path	= '/home/pawan/vcnew/wvc/common/session/v2' ,
	internal_port = 3179 ;

var	list		= {} ;

function start( info){

	console.log({ docker : docker}, 'docker constructor run');

	docker.run(image, [], process.stdout,
	   {
		   Binds	: [ abs_path + ":/session" ],
		   detached	: true ,
		   interactive: true,
		   tty		: true ,
		   publish	: internal_port ,
		   name		: 'pawan_' 
	   },
	   function( err, data, container){		// not called immediately if no error
			console.log({
				err : err ,
				data : data ,
				container : container
			}, 'callback');
		})
		.on('container',function( container){
			console.log({
				container : container
			}, 'container event');
		})
		.on('data', function( data){		// not called immediately
			console.log({
				data : data
			}, 'data event');
		})
		.on('stream', function( stream){
			console.log({
				stream : stream
			}, 'stream event');
		});
};

function stop(){

};

module.exports = {
	start : start ,
	stop  : stop
};
