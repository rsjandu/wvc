var express             = require( 'express' );
var app                 = express();
var server              = require( 'http' ).createServer( app ) ;
var path                = require( 'path' );
var passport            = require( 'passport' );
var util                = require( 'util' );
var body_parser         = require( 'body-parser' );
var cookieParser        = require( 'cookie-parser' );
var session             = require( 'express-session' );
var redis               = require( 'connect-redis' )( session );
var args                = require( 'common/args' );
var log                 = require( 'auth/common/log' );
var login               = require( 'auth/routes/login' );
var config              = require( 'auth/routes/config' );
var authentication      = require( 'auth/routes/app_soc' );
var flash               = require( 'connect-flash' );
var proxy               = require('common/proxy');

//configure Express
app.set( 'views', __dirname + '/views' );
app.engine( '.html', require('ejs').renderFile );
app.set( 'view engine', 'jade' );
app.use( cookieParser()); 
app.use( body_parser.json());
app.use( body_parser.urlencoded({
		extended: true
	})
);

app.use( flash() );

app.use( session({ 
		secret: '$#@&*This_is!@#$Secret)(*&WizIQAuth)',
		name:   'vc_auth',
		store:  new redis ({
			host: '127.0.0.1',
			port: 6379
		}),
		proxy:  true,
		resave: true,
		saveUninitialized: true
	})
);

app.use( passport.initialize());
app.use( passport.session());

proxy.add_route ('/auth', 'http://localhost:2178/auth');

app.get('/', function(req, res){
	/*
	 * Nobody has any business hitting our root.
	 * Return with 403 */
	res.status(403).send('forbidden');
});

/*
 * This is the route which should get hit when a user
 * is redirected for auth */
app.use('/login', login);
app.use('/config', config);
/*
 * This is the route which gets hit in case of a callback 
 * for a 3rd party authentication (like google) */
app.use('/auth', authentication);

module.exports = app;
