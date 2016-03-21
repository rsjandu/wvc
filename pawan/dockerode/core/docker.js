var Docker = require('dockerode') ;

var docker		= new Docker() ,
	image		= 'wiziq/session:v2.2' ,
	abs_path	= '/home/pawan/vcnew/wvc/common/session/v2' ,	//<-- put the val
	internal_port = 3179 ;

var	list		= {} ;

function start( info){

	docker.run(image, [], process.stdout, 
	   {
		   name		: 'pawan_' ,
		   detached	: true ,
		   tty		: true ,
		   publish	: internal_port ,
		   volume	: abs_path + ':/session' 	//<-- is it right?
	   },
	   function( err, data, container){
			console.log({
				err : err ,
				data : data ,
				container : container
			});
		});
};

function stop(){

};

module.exports = {
	start : start ,
	stop  : stop
};
