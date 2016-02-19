/* 
 * sub-app content
 * */


var express = require('express') ,
	core 	= require('routes/core')  ,
	account	= require('routes/account')  ;



var router = express.Router();			/* not sure if it should be 'app' */

router.use('/account', account);

router.get('/', core);


module.exports = router;
