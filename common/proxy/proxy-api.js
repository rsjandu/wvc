



var log = require('./log');
var proxy   = new require('redbird')({
	port : 80,
	ssl : {
		port : 443,
	key  : 'certificates/dev-key.pem',
	cert : 'certificates/dev-cert.pem',
	}
});
var host = require('./args');

var proxy_api = {};

var docker_monitor = require('node-docker-monitor');

function dockermonitor(){
	docker_monitor({
		onContainerUp: function(container) {
			log.info('Container up::::: ', JSON.stringify(container));
			log.info('container Name::'+container.Name);
			log.info('container Port::'+container.Ports[0].PublicPort);
			proxy.register(host + '/session/'+container.Name, "localhost:"+container.Ports[0].PublicPort);
			log.info('registered:::https://'+host+'/landing/session/v1/'+container.Name);
		},

		onContainerDown: function(container) {
			log.info('Container down:::: ',JSON.stringify(container));
			proxy.unregister(host + '/session/'+container.Name);
			log.info('unregistered:::https://'+host+"/landing/session/v1/"+container.Name);
			log.info('container Name:::'+container.Name);
			log.info('container port:::'+container.Ports[0].PublicPort);
		}
	});
};
dockermonitor();


proxy_api.register = function (req, res, next) {
	var serverid = req.body.server_id;
	var port = req.body.port;
	log.info('proxy_api registered route');
	log.info('Server id == '+ serverid);
	log.info('Server port == ' + port);
	var Validity = checkrequest(serverid, port, "r");
	if (Validity.valid) {
		switch(serverid){
			case "landing":
			case "auth":
				proxy.register(host + '/' + serverid + '/', "http://localhost:" + port + '/' + serverid + '/');
				res.json({message : "server registered"});
				break;
			case "code-editor":
				proxy.register(host + '/' + serverid + '/', "http://localhost:" + port + "/channel/");
				res.json({message : "server registered"});
				break;
			default:
				res.json({message : "illegal server"});
		};
	}
	else{
		res.json({message : Validity.msg});
	}
};


proxy_api.unregister = function (req, res, next) {
	var serverid = req.body.server_id;
	var port = req.body.port;
	log.info('proxy_api unregistered route');
	log.info('Server id == '+ req.body.server_id);
	log.info('Server port == ' + req.body.port);
	var Validity = checkrequest(serverid, port, "ur");
	if (Validity.valid){
		switch(serverid){
			case "landing":
			case "auth":
				proxy.unregister(host + '/' + serverid + '/', "http://localhost:" + port + '/' + serverid + '/');
				res.json({message: "server unregistered"});
				break;
			default:
				res.json({message : "request from unidentified server"});
		};
	}
	else{
		res.json({message : Validity.msg});
	}
};

proxy_api.listall = function (req, res, next) {
	var public_path = null;
	var private_path = null;
	var allPaths = {};
	var allProxies = [];
	var host_name = req.params.host_id;
	log.info('proxy_api list all the routes');
	for (var i=0 ; i<proxy.routing[host_name].length ; i++) {
		for (var j=0 ; j<proxy.routing[host_name][i].urls.length ; j++){
			public_path = "https://"+ host_name +proxy.routing[host_name][i].path;
			private_path = proxy.routing[host_name][i].urls[j].href;
			allProxies.push({
				"public_path" : public_path,
				"private_path" : private_path
			});
		}
	}
	allPaths.allProxies = allProxies;
	res.json(allPaths);
};

module.exports = proxy_api;

function checkrequest(serverid, port, type){
	var proxy_paths = proxy.routing.localhost;
	var server_index;
	var reply_info = {};
	for (var i=0; i<proxy_paths.length ; i++) {
		if (proxy_paths[i].path === "/" + serverid + "/"){
			server_index = i;
			break;
		}
	};
	for (var i=0 ; i< proxy_paths[server_index].urls.length ; i++){
		switch (serverid){
			case "landing":
			case "auth":
				if (proxy_paths[server_index].urls[i].href === "http://localhost:"+ port + "/" + serverid + "/"){
					if (type === "r"){
						log.info ("Route already registered");
						reply_info.valid = false;
						reply_info.msg = "Route already registered";
						return reply_info;
					}
					else if (type === "ur"){
						reply_info.valid = true;
						return reply_info;
					}
				};
				break;
			case "code-editor":
				if (proxy_paths[server_index].urls[i].href === "http://localhost:"+ port + "/channel/"){
					if (type === "r"){
						log.info ("Route already registered");
						reply_info.valid = false;
						reply_info.msg = "Route already registered";
						return reply_info;
					}
					else if (type === "ur"){
						reply_info.valid = true;
						return reply_info;
					}
				};
				break;
			case "chat":
				if (proxy_paths[server_index].urls[i].href === "http://localhost:" + port + "/"){
					if (type === "r") {
						log.info ("Route already registered");
						reply_info.valid = false;
						reply_info.msg = "Route already registered";
						return reply_info;
					}
					else if (type === "ur"){
						reply_info.valid = true;
						return reply_info;
					}
				}
				break;
			default:
				log.info('Illegal request from server = '+ serverid + '::' + port);
				reply_info.valid = false;
				reply_info.msg = "Illegal request from server = " + serverid + "::" + port;
				return reply_info;
		};
	}
	switch (serverid) {
		case "landing":
		case "auth":
		case "code-editor":
		case "chat":
			if (type === "r"){
				reply_info.valid = true;
				return reply_info;
			}
			else if (type === "ur"){
				log.info("Route already unregistered");
				reply_info.valid = false;
				reply_info.msg = "Route already unregistered";
				return reply_info;
			}
			break;
		default:
			log.info("Request from illegal server = " + serverid + "::" + port);
			reply_info.valid = false;
			reply_info.msg = "Request from illegal server = " + serverid + "::" + port;
			return reply_info;
	};
};


/*
 *  * Routes for the landing page */
proxy.register(host + '/landing/', "http://localhost:2178/landing/");
proxy.register(host + '/auth/', "http://localhost:2178/auth/");
/*
 *  * Routes for the session cluster docker for 'test-internal' */
//proxy.register(host + '/session/test-internal', "localhost:7777/");
////proxy.register(host + '/session/meghadoot', "localhost:7778/");
//
proxy.register(host + '/code-editor/', "http://localhost:8000/channel/");
proxy.register(host + '/', "localhost:5000/");
proxy.register(host + '/socket.io/', "localhost:5000/socket.io/");
proxy.register('cloud_app/code-editor/', "http://localhost:8800/channel/");
//proxy.register(host + '/log', "localhost:24224/");
