var router     = express.Router();
var proxy_api  = require('./proxy-api');
var log        = require('./log');

router.post ('/addRoute', proxy_api.register);
router.post ('/deleteRoute', proxy_api.unregister);
router.get  ('/listRoutes', proxy_api.listall);
