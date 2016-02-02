var express    = require('express');
var path       = require('path');
var log        = require('auth/common/log');
var dbDelete    = require('auth/controllers/dbDelete');
var router     = express.Router();
var db         = require('auth/common/db');

router.get('/', dbDelete.show);

router.post('/', function(req, res) {
	console.log(req.body.hostName);
	console.log(req.body.authType);
	db.delete_entry_from_db(req.body)
	.then( function done(){
		res.contentType('json');
		res.send({ some: JSON.stringify({response:'json'}) });
	},
	function fail(err)
	{
		log.error({Error:"error in deleting values to db "+err});
	}
		 );

});

module.exports = router;

