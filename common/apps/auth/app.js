var express          = require( 'express' );
var app              = express();
var server           = require( 'http' ).createServer( app ) ;
var passport         = require( 'passport' );
var util             = require( 'util' );
var bodyParser       = require( 'body-parser' );
var cookieParser     = require( 'cookie-parser' );
var session          = require( 'express-session' );
var RedisStore       = require( 'connect-redis' )( session );
var GoogleStrategy   = require( 'passport-google-oauth2' ).Strategy;


// API Access link for creating client ID and secret:
// https://code.google.com/apis/console/
var GOOGLE_CLIENT_ID      = "110830087787-gatfeqvo3kurncp8mf1h52a1eqa5fbs9.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET  = "Ct6XmPLMMwUI3ptcJjM0Pyr9";

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    //NOTE :
    //Carefull ! and avoid usage of Private IP, otherwise you will get the device_id device_name issue for Private IP during authentication
    //The workaround is to set up thru the google cloud console a fully qualified domain name such as http://mydomain:3000/ 
    //then edit your /etc/hosts local file to point on your private IP. 
    //Also both sign-in button + callbackURL has to be share the same url, otherwise two cookies will be created and lead to lost your session
    //if you use it.
    callbackURL: "http://localhost:2178/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

// configure Express
app.set('views', __dirname + '/views');
app.engine('.html', require('ejs').renderFile);
app.set('view engine', 'jade');
app.use( express.static(__dirname + '/public'));
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
	 * 		maybe delete the cookie and send login page or smth
	 */

	/* user doesn't hv auth cookie 					<========= mostly the case
	 * return a login page
	 */
	res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
	var origin = req.cookies.wiziq_origin;
	var MAX_SIZE_COOKIE = 4096;
	/* read cookie and maybe remove this cookie as it is needed no more */
	if( origin){
		var info = {
			/* all the required fields goes here.. for now just sending the whole payload */
			user : req.user
		};
		var auth_string = JSON.stringify(info);
		if( Buffer.byteLength( auth_string ) > MAX_SIZE_COOKIE ){
			auth_string = "error: size_limit_exceeded";
		}
		auth_string = new Buffer( JSON.stringify( auth_string)).toString('base64');
		res.cookie('wiziq_auth' , auth_string );
		res.redirect( origin);
	}
	else{
		res.send('cookie origin???: ' + origin);
	}
/*  res.render('account', { user: req.user }); */
});

app.get('/login', function(req, res){
  res.render('login.mat-design.jade', { user: req.user });
});

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google', passport.authenticate('google', { scope: [
       'https://www.googleapis.com/auth/plus.login',
       'https://www.googleapis.com/auth/plus.profile.emails.read'] 
}));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get( /*'/auth*/ '/google/callback', 
    	passport.authenticate( 'google', { 
    		successRedirect: '/auth/account',
    		failureRedirect: '/auth/login'
}));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//server.listen( 3000 );


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('auth/login');
}

module.exports = app;
