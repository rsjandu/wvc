var express             = require( 'express' );
var app                 = express();
var server              = require( 'http' ).createServer( app ) ;
var path                = require('path');
var passport            = require( 'passport' );
var util                = require( 'util' );
var bodyParser          = require( 'body-parser' );
var cookieParser        = require( 'cookie-parser' );
var session             = require( 'express-session' );
var RedisStore          = require( 'connect-redis' )( session );

var args                = require( 'common/args' );
var log                 = require( 'auth/common/log' );
var login               = require( 'auth/routes/login' );
var db                  = require( 'auth/common/db' );
var authentication      = require( 'auth/socialAuth/app_soc' );

var add_data_to_db      = require( 'auth/routes/dbEntry' );
var delete_data_from_db = require( 'auth/routes/dbDelete' );

var flash = require('connect-flash');

//configure Express
app.set('views', __dirname + '/views');
app.engine('.html', require('ejs').renderFile);
app.set('view engine', 'jade');
app.use( cookieParser()); 
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({
		extended: true
	})
);

app.use( flash() );

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
	})
);
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


app.use('/login',create_collection,login);

/*to add data to db via RESTful API*/
app.use('/dbEntry',add_data_to_db);

/*to delete data from db via RESTful API*/
app.use('/dbDelete',delete_data_from_db);

app.use('/auth',authentication);

function create_collection(req,res,next)
{
	db.createSchema()
		.then(
				next, function fail( err){
				log.info({Error : "Addition of data to db failed "+err});
				} );
}

module.exports = app;
