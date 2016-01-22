/*
 *  Used to update list of routes whenever proxy registers or unregisters   */

var route_list  = {};
var routes		= {};

route_list.add_route = function (key, val){
	routes[key] = {
		val : val
	};
};

route_list.remove_route = function (key){
	if (routes[key])
		delete routes[key];
};

route_list.routes = routes;

module.exports = route_list;
