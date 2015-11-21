var events   = require('events');
var mongodb  = require('mongodb');
var mongoose = require('mongoose');
var log      = require('api-backend/common/log').child({ module : 'mongoose' });

/*
 * Initialize and connnect */
mongoose.connect('mongodb://localhost/wiziq-v1');

var state = 'not-open';
var emitter = new events.EventEmitter();
var _db = mongoose.connection;

_db.on('error', function (err) {
	log.error ({ error : err }, 'Connection error');
});

_db.once('open', function (callback) {
	state = 'connected';
	log.info ('connection OK');
	emitter.emit('db-connected');
});


var db = {};
db.mongoose = mongoose;
db.emitter  = emitter;

module.exports = db;
