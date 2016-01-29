var express          = require( 'express' );
var router           = express.Router();
var fb_auth          = require( 'auth/socialAuth/fb' );
var google_auth      = require( 'auth/socialAuth/google' );
var wiziq_auth       = require( 'auth/routes/wiziq_auth' );


router.use('/google',google_auth);

router.use('/fb',fb_auth);

router.use('/wiziq',wiziq_auth);

module.exports = router;





