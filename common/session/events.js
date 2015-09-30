var EventEmitter    = require('events').EventEmitter;
var emitter = new EventEmitter();

var events = {};
events.emit = function (e, data) {
	emitter.emit ('global:' + e, data);
};

events.on = function (e, callback) {
	emitter.on ('global:' + e, callback);
};

module.exports = events;
