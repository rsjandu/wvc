var events = require('events');
var bunyan = require('bunyan');
var log = require ('common/log').sub_app('provisioning');

function serializer (req, res) {
	if (!req || !req.connection)
		return req;

	var entry =  {
		method: req.method,
		url: req.url,
		req_id: req.req_id,
		/*
        header: req.headers,
        cookie: req.headers.cookie,
	   */
		remoteAddress: req.connection.remoteAddress,
		remotePort: req.connection.remotePort
	};

    if (!res || !res.statusCode)
        return entry;

    entry.statusCode =  res.statusCode;

	return entry;
}

log.req_logger = function (req, res, next) {
	req.log = log;
	log.info({ req : serializer (req, res) }, 'http request');
	next();
};

log.err_logger = function (err, req, res, next) {
	var entry = {};

	if (err) {
		entry.err = err;
		if (err.stack)
			entry.stack = err.stack;
		entry.req = serializer (req, res);

		log.error (entry, 'error');
	}
	next(err);
};

module.exports = log;
