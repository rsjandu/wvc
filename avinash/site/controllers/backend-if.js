var async     = require('async');
var config    = require('../config');
var log       = require('../common/log');
var cache     = require('../common/cache').init('backend-if', 5*60*60*1000);
var templates = require('../controllers/templates');


/*
 * This is a interface to the actual backend. Going forward
 * the backend may reside on a different location and the 
 * communication to it will be be controlled by this module.
 *
 * For now, we code the backend right here.
 *
 */

controller = {};
controller.get_config = function (sess_id, callback) {
	/*---------------------------------------
	 *
	 * Things to do:
	 *
	 * 		- If the session config is in the cache
	 * 		  then return it
	 *
	 * 		- else load the session configuration
	 * 		  from the core backend
	 *
	 * 		- Cache it
	 *
	 *--------------------------------------*/

	var session_config = { 
				template : 'default',
				auth : {},
				connection_info : {},
				resources : [
					{
						name: 'youtube',
						display_spec: { widget: "av" },
						perms: { },
						custom: { url: 'https://youtu.be/A18NJIybVlA' },
					},
					{
						name: 'notify-box',
						display_spec: { widget: 'notify' },
						perms: { }
					}
				],
	};


	callback (null, session_config);
};


module.exports = controller;
