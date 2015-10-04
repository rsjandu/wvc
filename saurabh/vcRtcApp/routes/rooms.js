var express = require('express');
var router = express.Router();

var roomResource = require('./../resource/roomManager');

router.get('/', roomResource.getRoom);
router.post('/', roomResource.createRoom);

router.post('/token', roomResource.createToken);
router.get('/token', roomResource.createToken);

module.exports = router;
