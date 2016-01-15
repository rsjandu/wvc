var express          = require( 'express' );
var app              = express();
var server           = require( 'http' ).createServer( app ) ;
var path            = require('path');
var passport         = require( 'passport' );
var util             = require( 'util' );
var bodyParser       = require( 'body-parser' );
var cookieParser     = require( 'cookie-parser' );
var session          = require( 'express-session' );
var RedisStore       = require( 'connect-redis' )( session );
var GoogleStrategy   = require( 'passport-google-oauth2' ).Strategy;
var FacebookStrategy = require( 'passport-facebook' ).Strategy;
var FbAuth           = require( 'auth/socialAuth/fb' );
var GoogleAuth       = require( 'auth/socialAuth/google' );
var config           = require( 'auth/socialAuth/oauth' );

var args             = require('common/args');
var log              = require('auth/common/log');
var login            = require('auth/routes/login');


//configure Express
app.set('views', __dirname + '/views');
app.engine('.html', require('ejs').renderFile);
app.set('view engine', 'jade');
app.use( cookieParser()); 
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({
	extended: true
}));
app.use( session({ 
	secret: 'cookie_secret',
	name:   'kaas',
	store:  new RedisStore({
		host: '127.0.0.1',
		port: 6379
	}),
	proxy:  true,
    resave: true,
    saveUninitialized: true
}));
app.use( passport.initialize());
app.use( passport.session());

app.get('/', function(req, res){

        /* if user has auth cookie and origin_cookie    <========= shouldn't happen but is a possible scenario
         *              maybe delete the cookie and send login page or smth
         */

        /* user doesn't hv auth cookie                                  <========= mostly the case
         * return a login page
         */
       // console.log('get / called ');
        res.render('index', { user: req.user });
});

app.use('/login', login);

//app.use('/auth/',GoogleAuth);
app.use('/google',GoogleAuth);

//app.use('/auth/fb',FbAuth);
app.use('/fb',FbAuth);


/*app.get('/logout', function(req, res){
  req.logout();
 //console.log('aaaaaaa');
  res.redirect('/auth/');
});*/

module.exports = app;
