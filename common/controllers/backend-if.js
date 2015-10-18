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

	var av_config = {
		maxvideo : 6,
		conftype :  'audiovideo',
		publish : true,
		videores : 'qvga',
		hdvideo : false,
		stats : false,
		maxvideores : 'vga',
		videolayout : 'horizontal'
	};

	var user_config = {
		name : null,
		id : null,
		role : 'moderator'
	};

	var ot = {
		name    : 'ot',
		enabled : true,
		port : 8080,
		host : '192.168.56.101'
	};

	var session_config = {
		structure: 'default',
		layout   : 'just-3',
		theme    : 'cardboard',
		auth : {},
		session_server : {
			host : 'localhost',
			port : config.session_server.default_port,
			auth : {}
		},
		resources : [
			{
				name: 'menu-sidepush-v1',
				display_spec: { widget: "nav", templates: [ 'demo' ], css: [ 'jquery.mmenu.all' ] },
				/*
				 * perms must be returned per user */
				perms: { },
				custom: {
				},
			},
			{
				name: 'cube',
				display_spec: { widget: "none", templates: [ 'cube' ], css: [ 'cube2' ] },
				/*
				 * perms must be returned per user */
				perms: { },
				custom: {
				},
			},
			{
				name: 'av-tokbox',
				display_spec: { widget: "av", templates: [ "av-tokbox" ] },
				/*
				 * perms must be returned per user */
				perms: { },
				custom: {
					random_string : 'welcome',
					config : av_config,
					user : user_config,
					server : ot
				},
			},
			{
				name: 'flipboard-v1',
				display_spec: { widget: "tabs", templates: [ "v1" ], css: [ 'bookblock', 'flipboard' ] },
				/*
				 * perms must be returned per user */
				perms: { },
				custom: {
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
