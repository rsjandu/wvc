/**
 * Logger init file
 */

var bunyan = require('bunyan');

var config = require('./../conf/config');

// TODO log config file.
var logFile = config.logger.configfile ||  '../conf/bunyan_config.json';

exports.getLogger = function getLogger(options) {
  var logOptions = {
    name: options
  };

  return bunyan.createLogger(logOptions);
};


exports.logger = bunyan;
//module.exports = logger;

