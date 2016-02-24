
var express = require('express')  ,
	core	= require('controllers/core-v1')  ;

var router = express.Router()  ;

router.param('store',function( req, res, next, store){
	req.store = store;
	next();
});

router.get('/:store/list/:dir_top', core.dir_list);		/* can we have a separate controller for dir? */
router.post('/:store/create/:dir', core.dir_create);	/* may not be needed anymore */
router.post('/:store/remove/:dir', core.dir_remove);

router.post('/:store/upload/get-tmp-path', core.upload);
router.delete(':store/remove/:file_path', core.remove);

//router.get('/get/:content_id', core.get); 			/* isn't it needed, as well? */


module.exports = router;
