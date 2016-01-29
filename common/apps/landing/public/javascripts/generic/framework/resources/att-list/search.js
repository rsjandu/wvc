define( function(require){
	var $		= require('jquery');
	var Listjs	= require('https://rawgit.com/javve/list.js/v1.1.1/dist/list.js');

	var search 	= {};
	var userlist = {};

	search.init = function(){

		/* pre-requisites for listjs to work */
		$('#atl-search input').addClass('search');
		$('#atl-list').addClass('list');

		var options = {
			valueNames : ['displayName','email']
		};
		userlist = new Listjs('atl-wrapper', options);

	};

	search.add = function( user){
		userlist.add(user);
	};

	search.remove = function( vc_id){
		userlist.remove('vc_id', vc_id);
	};
	return search;
});
