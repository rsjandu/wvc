/* 
 * This is what follows  '/insecure'
 */

var	express = require('express') ;

var	content  = require('content/main') ,
	convert  = require('convert/main') ;




var app 	= express()  ,
	_port	= '7099'     ;

app.use('/', content);
app.use('/convert', convert);


//if( app.get('env') == 'development'){
	app.use(function(err, req, res, next){
		res.status( err.status || 500);
		res.send('error'); /* or maybe res.end or smth */
		/* log the err */
	});
//}

app.listen( _port);
