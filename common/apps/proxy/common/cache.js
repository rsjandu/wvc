var cache = require('../../common/cache');

cache = cache.init('proxy-routes' /* Infinite expiry */);
cache.emitter.on('redis-status', route_cache);

module.exports = cache;
