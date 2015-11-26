var log = require ('./log');

var config = {};

/*
 * API-BACKEND config here
 */
config.api = {};
config.api.mongo = 'mongodb://localhost/wiziq-v1';

/*
 * PROVISIONING config here
 */
config.prov = {};
config.prov.mongo = 'mongodb://localhost/prov-v1';

module.exports = config;
