var ioredis = require('ioredis');
var log     = require('./log');
var config  = require('../config');

/*
var redis = new ioredis({
				retryStrategy : function (times) { return config.redis.retry_interval; }
		});
*/

var cache = {};
cache.connected = false;
cache.key_expire_time = 7 * 24 * 60 * 60; /* 7 days */

/*
redis.on('connect', function () {
				cache.connected = true;
				log.info('Connection to Redis Cache ok');
		});

redis.on('error', function () {
				cache.connected = false;
				log.info('Connection to Redis Cache reported error');
		});

redis.on('close', function () {
				cache.connected = false;
				log.info('Connection to Redis Cache closed');
		});

redis.on('reconnecting', function () {
				log.info('Re-connecting to Redis Cache ...');
		});
*/

cache.init = function (namespace, expire) {
/*
 * Disabling this for now, due to irritating reconnect messages
 *
		return {
				set : function (key, value) {
						if (!cache.connected) {
								log.warn ('cache: set key failed. Not connected to Redis.');
								return;
						}

						key = namespace + '->' + key;

						redis.set (key, value);
						redis.expire (key, expire);
				},
				get : function (key, f) {
						if (!cache.connected) {
								log.warn ('cache: get key failed. Not connected to Redis.');
								f('not connected', null);
								return;
						}

						key = namespace + '->' + key;
						redis.get(key, f);
				},
				invalidate : function (key) {
					log.error ('invalidating key: ' + key);
					redis.del (key);
				}
		};
*/
};

cache.invalidate = function () {
		log.info ('cache.invalidate: flush all');
		redis.flushall();
};

module.exports = cache;
