var express		= require('express') ;

var app		= express() ,
	_do		= require('./core/docker') ,
	port	= '7088';

_do.start();

app.listen( port);

