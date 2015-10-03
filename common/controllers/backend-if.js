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
				session_server : {
					host : 'localhost',
					port : config.session_server.default_port,
					auth : {}
				},
				resources : [
					{
						name: 'av-tokbox',
						display_spec: { widget: "av", template: "av-tokbox" },
						/*
						 * perms must be returned per user */
						perms: { },
						custom: { 
							random_string : 'नमस््कार'
						},
					}
				],
				role_map : {
					teacher : [
						{
							name : 'av-test',
							perms : [
								'audio.mute:*',
								'audio.unmute:*',
							]
						},
					],
					student : [
						{
							name : 'av-test',
							perms : [
								'audio.mute:*',
								'audio.unmute:*'
							]
						},
					],
					observer : {
					}
				},
				attendees : {
					max : 10,
					listed : [
						{
							name : 'Avinash Bhatia',
							role : 'teacher',
							auth : {
								via : 'noauth' /* noauth, wiziq, local, google+, facebook or other SSOs */
							}
						}
					],
				}
	};


	callback (null, session_config);
};


module.exports = controller;
