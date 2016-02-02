var docker_monitor  = require('node-docker-monitor');
var proxy           = require('./proxy');
var log             = require('./common/log');
var host            = require('./args');
var route_list      = require('./route-list');
var cache           = require('./common/cache');

var key;
var value;

function dockermonitor () {

	docker_monitor({

		onContainerUp: function(container) {
			log.info(container, "docker-start-info");
			key = '/session/' + container.Name;
			value = 'localhost:' + container.Ports[0].PublicPort + '/';
			if (route_list.routes[key]){
				if (route_list.routes[key].val == value){
					log.info({info : "Route already exists"}, "register docker");
					return;
				}
				
				log.warn({container_name: container.Name}, 'Updating docker route');
				proxy.unregister(host + key);
				route_list.remove_route(key);
			}
			proxy.register(host + key, value);
			route_list.add_route(key, value);
			cache.set(key, value);
		},

		onContainerDown: function (container) {
			log.info(container, "docker-stop-info");
			key = '/session/' + container.Name;
			if (!route_list.routes[key]){
				log.error({err:"Docker route not exists"},"unregister docker");
				return;
			}
			proxy.unregister(host + key);
			route_list.remove_route(key);
			cache.get(key)
				.then(
						function (value){
							cache.invalidate(key);
						},
						function () {
							log.error({err: "Cache data inconsistant::docker-monitor"}, "cache error");
						}
					);
		}

	});
}

dockermonitor();
