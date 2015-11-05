var EventEmitter    = require('events').EventEmitter;
var log             = require("../common/log");
var emitter = new EventEmitter();

var events = {};
function emit (prefix, e, data) {
	log.debug ('event - EMIT - ' + prefix + '.' + e);
	emitter.emit (prefix + '.' + e, data);
}

function on (prefix, e, callback) {
	emitter.on (prefix + '.' + e, function (data) {
		log.debug ('event - TRIG - ' + prefix + '.' + e + ', data = ', (data ? data : 'none'));
		callback (data);
	});
}

function ev (name) {
	var prefix = name;

	return {
		emit : emit.bind(this, prefix),
		on   : on.bind(this, prefix),
	};
}

module.exports = ev;
