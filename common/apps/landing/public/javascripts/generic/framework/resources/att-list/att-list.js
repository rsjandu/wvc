/* 
 * List of users
 * present in the session
 */

define(function(require){
	var $ 			= require('jquery');
	var framework	= require('framework');
	var widget 		= require('./widget');
	var listener 	= require('./listener');

	var att = {};
	
	att.init = function( display_spec, custom, perms){
		var _d = $.Deferred();
		if( !display_spec.anchor || display_spec.templates.length != 2){
			_d.reject('wrong info from backend');
			return _d.promise();
		}
		var templates = [];

		var f_handle = framework.handle('att-list');

		var anchor = display_spec.anchor;
		templates.push( f_handle.template(display_spec.templates[0]) );
		templates.push( f_handle.template(display_spec.templates[1]) );
	
		widget.init( anchor, templates, perms)
/*			.then( buttons.init , _d.reject( msg))	/* but control buttons doesn't exist yet, but jquery has a way i think to handle this */
			.then( _d.resolve(), _d.reject());
		
		listener.init();
		
		return _d.promise();
	};

	att.start = function( info, class_info){
		var users = class_info.attendees; /* an array of users already present */
		console.log('received class info: ' + users.toString());
		
		users.forEach( function(user){
			widget.add_user( user);
		});
		/* 
		 *	fetch attendee list maybe
		 *		if new user doesn't get it by default
		 */
//		new_user_simulator();
	};
	
	function new_user_simulator(){
		var user = {};
		user.name = "Sample User";
		user.avatar = 'https://lh3.googleusercontent.com/-jS7UdNJ5uf4/VRFwlQusVvI/AAAAAAAACB4/SHHRqLVfCCs/w40-h39-p/dp.jpg';
		user.options = [];
		user.options.push('Give writing Controls');
		user.options.push('Give audio Controls');
		user.joined  = 'time here';
		new_user_handler(user, {});
	}

	function new_user_handler( usr, perms){
		var _d = $.Deferred();
		usr.name = usr.name || "new_johny";
		widget.add_user( usr);

/*		users.join( user)		/* maybe we need perm of the new user here as well *
		.then( window.add_user(user) );
		/* 
		 * handle new user
		 * paste a new leaf as allowed by
		 * own permission set and the info about user( have writing controls or not)
		 */

		return _d.promise();
	}

	return att;
});
