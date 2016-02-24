/* 
 * _need to discuss
 * will most likely be done on local db */
var log = require('common/log');

var dir = {};

dir.list = function( store, parent, cb){
	log.info('dir list called');
	/* query db and return json */
	cb({ 'directory': 'structure'});
};

dir.create = function(){
	/* mprob be an internal function rather than an api call */
	log.info('dir create called');
};

dir.remove = function(){
	/* this need some effort
	 * 		-- create xml 
	 * 		-- and delete multiple files.. */
	log.info('dir remove called');
};

module.exports = dir;
