var express          = require( 'express' );
var app              = express();
var FbAuth           = require( 'auth/socialAuth/fb' );
var GoogleAuth       = require( 'auth/socialAuth/google' );


app.use('/google',GoogleAuth);

app.use('/fb',FbAuth);

module.exports = app;





