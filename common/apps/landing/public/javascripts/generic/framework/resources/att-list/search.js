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
			valueNames : ['displayName','email','att_id']
		};
		userlist = new Listjs('atl-wrapper', options);

	};

	search.add = function( user){
		userlist.add(user);
	};

	search.remove = function( att_id){
		userlist.remove('att_id', att_id);
	};
	return search;
});
