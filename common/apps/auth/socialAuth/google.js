var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var config = require('./oauth.js');
var encodeGoogle     = require('./encode.js');

var express          = require( 'express' );
var app              = express();
var server           = require( 'http' ).createServer( app ) ;
var path             = require('path');
var passport         = require( 'passport' );
var util             = require( 'util' );
var bodyParser       = require( 'body-parser' );
var cookieParser     = require( 'cookie-parser' );
var GoogleStrategy   = require( 'passport-google-oauth2' ).Strategy;
var args             = require('common/args');
var log              = require('auth/common/log');
var login            = require('auth/routes/login');

passport.use(new GoogleStrategy({
  clientID: config.google.clientID,
  clientSecret: config.google.clientSecret,
  callbackURL: config.google.callbackURL,
  passReqToCallback   : true
  },
  function(request,accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));


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

app.get('/account', ensureAuthenticated, function(req, res){
        var origin = req.cookies.wiziq_origin;
       //var origin = '/landing/session/v1/meghadoot';
        var MAX_SIZE_COOKIE = 4096;
        /* read cookie and maybe remove this cookie as it is needed no more */
        log.info(req.user, 'google user info');
        console.log('wiziq origin cookie '+origin+' '+req.cookies.wiziq_origin);
        if(origin){
                var info = {
                        /* all the required fields goes here.. for now just sending the whole payload */
                        user : req.user
                };
                //***************************************
                //fetch all the necessary info from user/info
                var user_identity =  encodeGoogle.getUserDetails(req.user);
                //***************************************
                //var auth_string = JSON.stringify(info);
                var auth_string = JSON.stringify(user_identity);
                console.log('buffer length  '+Buffer.byteLength( auth_string ));
                if( Buffer.byteLength( auth_string ) > MAX_SIZE_COOKIE ){
                        auth_string = "error: size_limit_exceeded";
                        console.log('auth string is an issue ***************');
                }
               // auth_string = new Buffer( JSON.stringify( auth_string)).toString('base64');
                auth_string = encodeURIComponent(auth_string);
                console.log('auth string googe ------------------ '+auth_string);
                res.cookie('wiziq_auth' , auth_string );
                res.redirect(origin);
          }
          else{
                res.send('cookie origin???: ' + origin);
                //res.redirect('/landing/session/v1/meghadoot');  
         }
/*  res.render('account', { user: req.user }); */
});


//app.use('/login', login);

// GET /
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/', passport.authenticate('google', { scope: [
       'https://www.googleapis.com/auth/plus.login',
       'https://www.googleapis.com/auth/plus.profile.emails.read']
}));

// GET google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/callback',
        passport.authenticate( 'google', {
                successRedirect: '/auth/google/account',
                failureRedirect: '/auth/login',
                failureFlash: 'Invalid username or password.'
}));



app.get('/logout', function(req, res){
  req.logout();
  //console.log('aaaaaaa');
  res.redirect('/auth/');
 //console.log('bbbbb ');
});

//server.listen( 3000 );


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  console.log('ensureAuth '+req.isAuthenticated());
  if (req.isAuthenticated()) { return next(); }
  res.redirect('login');
}


module.exports = app;
