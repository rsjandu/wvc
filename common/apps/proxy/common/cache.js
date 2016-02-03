var cache = require('../../common/cache');

cache = cache.init('proxy-routes', 4*60*60*1000);

module.exports = cache;
