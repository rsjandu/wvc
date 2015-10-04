var express = require('express');
var router = express.Router();


usersCallback = function usersCallback(req, res, next) {
  res.send('GET /users respond with a resource !!');
};

/* GET users listing. */
router.get('/', usersCallback);

module.exports = router;
