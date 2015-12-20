define(function(require) {
	var log = require('log')('identity', 'info');
	var random_names = require('names');

	var id = {};

	/*
	 * This should extract and store the identity of the 
	 * current user. Likely this will happen by extracting
	 * the encrypted information in the cookies, which will
	 * be stored via the passport auth module. TODO.
	 *
	 * Hardcoding for now. */

	id.name = "";
	id.display_name = random_names();
	id.sys_assigned = random_names();

	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for( var i=0; i < 5; i++ )
		id.name += possible.charAt(Math.floor(Math.random() * possible.length));

	return id;
});
