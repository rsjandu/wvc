
var express = require('express')  ,
	core	= requie('controllers/core')  ;			/* make it work without '../' */

var router = express.Router()  ;


router.get('/get/:content_id', core.get);
router.post('/upload', core.upload);
router.delete('/remove/:content_id', core.remove);


module.exports = router;
