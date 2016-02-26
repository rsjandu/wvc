/*--------------------------------*
 *  _content_management_server_   *
 *--------------------------------*/
require('app-module-path').addPath( __dirname);		/* to avoid '../'s in require stmts */

var express		= require('express') ,
	bodyParser	= require('body-parser') ,
	core 	  	= require('routes/core-v1')  ,
	account	  	= require('routes/account-v1')  ,
	resources 	= require('resources')  ,
	log 	  	= require('common/log')  ;

var app 	= express()  ,
	_port 	= '7099'  ;

app.use( bodyParser.json() );

app.use('/user/v1', account);

app.use('/content/v1', core);

app.use( function(err, req, res, next){
	res.status( err.status || 500);
	res.send('error');
	log.err('No match found:: ' + err);
});

resources.init()
.then(
	start,
	exit
);

function start(){
	log.log('\n**************************');
	log.info('Started, listening on: '+ _port);
	log.log('**************************\n');
	app.listen(_port);
}

function exit( msg){
	log.err('App start err: ' + msg);
	process.exit(1);
}


/* maybe call resource.release on shutdown */
