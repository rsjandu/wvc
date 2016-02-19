

var express = require('express')  ,
	account = require('controllers/account');		/* don't want to use '../' find a good method */


var router = express.Router();

router.get('/', account.get);



module.exports = router;
