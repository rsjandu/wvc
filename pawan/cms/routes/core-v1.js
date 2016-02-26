
var express = require('express')  ,
	core	= require('controllers/core-v1')  ;

var router = express.Router()  ;

router.param('email',function( req, res, next, email){
	req.email = email;
	req.store = 's3';
	next();
});

router.post('/user/:email/add', core.add);			//____create content
router.post('/user/:email/added', core.added);
	
router.get('/user/:email/list', core.list);			//____retrieve content

router.post('/user/:email/update', core.update);		//____update content			<--not implemented yet--

router.post('/user/:email/remove', core.remove);		//____delete content

module.exports = router;
