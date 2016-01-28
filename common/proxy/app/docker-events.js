var docker_monitor  = require('node-docker-monitor');
var proxy           = require('./proxy');
var log             = require('./log');
var host            = require('./args');
var route_list      = require('./route-list');

var key;
var value;

function dockermonitor () {

	docker_monitor({

		onContainerUp: function(container) {
			log.info(container, "docker-start-info");
			key = '/session/' + container.Name;
			value = 'localhost:' + container.Ports[0].PublicPort + '/';
			if (route_list.routes[key]){
				if (route_list.routes[key] === value){
					console.log("Route already exists");
					return;
				}
				proxy.unregister(host + key);
				route_list.remove_route(key);
			}
			proxy.register(host + key, value);
			route_list.add_route(key, value);
		},

		onContainerDown: function (container) {
			log.info(container, "docker-stop-info");
			key = '/session/' + container.Name;
			if (!route_list.routes[key]){
				log.error({err:"Docker route not exists"},"error log");
				return;
			}
			proxy.unregister(host + key);
			route_list.remove_route(key);
		}

	});
}

dockermonitor();
