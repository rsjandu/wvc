var express    = require('express');
var path       = require('path');
var log        = require('auth/common/log');
var dbEntry    = require('auth/controllers/dbEntry');
var router     = express.Router();
var db         = require('auth/common/db');

router.get ('/', dbEntry.show);

router.post('/'/*,bodyParser.json()*/, function(req, res) {
	console.log(req.body.hostName);
	console.log(req.body.authType);
	console.log(req.body.clientID);
	console.log(req.body.clientSecret);
	console.log(req.body.callbackURL);
	db.add_data_to_db(req.body)
	.then( function done(){
		res.contentType('json');
		res.send({ some: JSON.stringify({response:'json'}) });
	},
	function fail(err)
	{
		log.error({Error:"error in adding values to db "+err});
	}
		 );

});

module.exports = router;


