var express   = require('express');
var path      = require('path');
var log       = require('auth/common/log');
var dbEntry   = require('auth/controllers/dbEntry');
var router    = express.Router();
var bodyParser = require( 'body-parser' );

router.use( bodyParser.json());
router.use( bodyParser.urlencoded({
    extended: true
}));

router.get ('/', dbEntry.show);

router.post('/',bodyParser,function(req,res){
           // if(err) {
                 //   console.log("error found .............."+err);
	               // return res.end("Error uploading file.");
	           // }
            res.end("File is uploaded");
            console.log("post request reached "+req.body.data.hostName);
});



module.exports = router;



