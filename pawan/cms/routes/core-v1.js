
var express = require('express')  ,
	core	= require('controllers/core-v1')  ;

var router = express.Router()  ;

router.param('email',function( req, res, next, email){
	console.log('\n\n');		//  <--temp 
	if( !email){
		res.send('email is a necessary url field, please consult api docs');
		return;
	}
	req.email = email;
	req.store = 's3';
	next();
});

router.post('/user/:email/add', core.add);			//____create content
router.post('/user/:email/added', core.added);
	
router.get('/user/:email/list', core.list);			//____retrieve content

router.post('/user/:email/update', core.update);		//____update content			<--not allowed--

router.delete('/user/:email/remove', core.remove);		//____delete content			<--not implemented yet--

module.exports = router;
