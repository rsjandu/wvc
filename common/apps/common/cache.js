var $       = require('jquery-deferred');
var ioredis = require('ioredis');
var events  = require('events');
var mylog   = require('./log').sub_module('cache');

var redis = new ioredis({
	retryStrategy : function (times) {
		/* for now keep it at 10 seconds */
		return Math.min(times * 1000, 10000); 
	}
});

/*
 * Created emitter to emit redis-satus event on connect or error */
var emitter = new events.EventEmitter();
var cache   = {};

cache.connected = false;

redis.on('connect', function () {
	cache.connected = true;
	mylog.info('Connection to Redis Cache ok');
	emitter.emit('redis-status', true);
});

redis.on('error', function (err) {
	mylog.error('Connection to Redis Cache reported error: ' + err);
	emitter.emit('redis-status', false);
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
				mylog.warn ('cache:invalidating key: ' + key);
				redis.del (key);
			},

			getall: function (namespace) {
				var _p      = $.Deferred();
				var reject  = _p.reject.bind(_p);
				var resolve = _p.resolve.bind(_p);

				if (!cache.connected) {
					mylog.warn ('get all keys failed. Not connected.');
					_p.reject ('not connected');
					return _p.promise();
				}

				redis.keys(namespace+"::*", function (err, val){
					if (err || val.length === 0) {
						mylog.debug ({namespace:namespace}, 'cache miss');
						reject (err);
						return _p.promise();
					}
					mylog.debug ({namespace:namespace}, 'cache hit');
					resolve (val);
				});

				return _p.promise();
			}
	};
};

cache.invalidate = function () {
	mylog.warn ('cache.invalidate: flush all');
	redis.flushall();
};

cache.emitter = emitter;

module.exports = cache;
