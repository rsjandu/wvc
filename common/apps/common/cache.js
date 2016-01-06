var $       = require('jquery-deferred');
var ioredis = require('ioredis');
var mylog   = require('common/log').sub_module('cache');

var redis = new ioredis({
	retryStrategy : function (times) {
		/* for now keep it at 10 seconds */
		return Math.min(times * 1000, 10000); 
	}
});

var cache = {};
cache.connected = false;

redis.on('connect', function () {
	cache.connected = true;
	mylog.info('Connection to Redis Cache ok');
});

redis.on('error', function (err) {
	mylog.error('Connection to Redis Cache reported error: ' + err);
});

redis.on('close', function () {
	if (cache.connected) {
		cache.connected = false;
		mylog.warn('Connection to Redis Cache closed');
	}
});

redis.on('reconnecting', function () {
	mylog.info('Re-connecting to Redis Cache ...');
});

cache.init = function (namespace, expire) {
	return {

		set : function (key, value) {

			key = namespace + '::' + key;

			if (!cache.connected) {
				mylog.warn ({ key:key }, 'set key failed. Not connected.');
				return;
			}

			mylog.debug ({key:key}, 'cache set');
			redis.set (key, value);
			redis.expire (key, expire);
		},

		get : function (key) {
			var _p      = $.Deferred ();
			var reject  = _p.reject.bind(_p);
			var resolve = _p.resolve.bind(_p);

			key = namespace + '::' + key;

			if (!cache.connected) {
				mylog.warn ({key:key}, 'get key failed. Not connected.');
				_p.reject ('not connected');
				return _p.promise();
			}

			redis.get(key, function (err, val) {

				if (err || !val) {
					mylog.debug ({key:key}, 'cache miss');
					reject (err);
					return _p.promise();
				}
				mylog.debug ({key:key}, 'cache hit');
				resolve (val);
			});

			return _p.promise();
		},

		invalidate : function (key) {
			key = namespace + '::' + key;
			mylog.warning ('cache:invalidating key: ' + key);
			redis.del (key);
		}
	};
};

cache.invalidate = function () {
	mylog.warning ('cache.invalidate: flush all');
	redis.flushall();
};

module.exports = cache;
