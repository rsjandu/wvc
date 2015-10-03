// configure your variables here

var config = {}

config.http = {};
config.db = {};
config.logger = {};

config.http.port = process.env.PORT || 8080;
// environment, change to production
config.http.env = process.env.NODE_ENV || 'development';

// Database configuration. Do not change if you do not plan to use redis
// are you using redis?
config.db.redis = false;
config.db.REDISTOGO_URL = process.env.REDISTOGO_URL;

module.exports = config;
