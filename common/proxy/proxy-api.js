



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
	var path = req.body.path;
	log.info('proxy_api registered route');
	log.info('Server id == '+ serverid);
	log.info('Server path == ' + path);
	var Validity = checkrequest(serverid, path, "r");
	if (Validity.valid) {
		switch(serverid){
			case "landing":
			case "auth":
			case "code-editor":
				proxy.register(host + '/' + serverid + '/', path);
				res.status(200).json({message : "server registered"});
				break;
			case "chat":
				proxy.register(host + '/', path);
				res.json({message : "server registered"});
				break;
			default:
				res.status(403).json({message : "illegal server"});
		};
	}
	else{
		res.status(403).json({message : Validity.msg});
	}
};


proxy_api.unregister = function (req, res, next) {
	var serverid = req.body.server_id;
	var path = req.body.path;
	log.info('proxy_api unregistered route');
	log.info('Server id == '+ req.body.server_id);
	log.info('Server path == ' + req.body.path);
	var Validity = checkrequest(serverid, path, "ur");
	if (Validity.valid){
		switch(serverid){
			case "landing":
			case "auth":
			case "code-editor":
				proxy.unregister(host + '/' + serverid + '/', path);
				res.status(200).json({message: "server unregistered"});
				break;
			case "chat":
				proxy.unregister(host + '/', path);
				res.status(200).json({message : "server unregistered"});
				break;
			default:
				res.status(403).json({message : "request from unidentified server"});
		};
	}
	else{
		res.status(403).json({message : Validity.msg});
	}
};

proxy_api.listall = function (req, res, next) {
	var public_path = null;
	var private_path = null;
	var allPaths = {};
	var allProxies = [];
	var host_name = host;//req.params.host_id;
	log.info('proxy_api list all the routes');
	for (var i=0 ; i<proxy.routing[host_name].length ; i++) {
		//for (var j=0 ; j<proxy.routing[host_name][i].urls.length ; j++){
		public_path = "https://"+ host_name +proxy.routing[host_name][i].path;
		private_path = proxy.routing[host_name][i].urls[0].href;
		allProxies.push({
			"public_path" : public_path,
			"private_path" : private_path
		});
		//}
	}
	allPaths.allProxies = allProxies;
	res.json(allPaths);
};

module.exports = proxy_api;

function checkrequest (serverid, path, type){
	var proxy_paths = proxy.routing[host];
	var reply_info = {};
	var index;
	for (var i=0 ; i<proxy_paths.length ; i++){
		switch (serverid){
			case "landing":
			case "auth":
			case "code-editor":
				if (proxy_paths[i].path === '/' + serverid + '/'){
					if (type === "r"){
						reply_info.valid = false;
						reply_info.msg = "Already a path is registered";
						return reply_info;
					}
					else if (type === "ur"){
						if (proxy_paths[i].urls[0].href === path){
							reply_info.valid = true;
							return reply_info;
						}
						else{
							reply_info.valid = false;
							reply_info.msg = "Trying to unregister a wrong path";
							return reply_info;
						}
					}
				}
				break;
			case "chat":
				if (proxy_paths[i].path === '/'){
					if (type === "r"){
						reply_info.valid = false;
						reply_info.msg = "Already a path is registered";
						return reply_info;
					}
					else if (type === "ur"){
						if (proxy_paths[i].urls[0].href === path){
							reply_info.valid = true;
							return reply_info;
						}
						else{
							reply_info.valid = false;
							reply_info.msg = "Trying to unregister a wrong path";
							return reply_info;
						}
					}
				}
				break;
			default:
				reply_info.valid = false;
				reply_info.msg = "Illegal server request";
				return reply_info;
		}	
	}
	if (type === "r"){
		reply_info.valid = true;
		return reply_info;
	}
	reply_info.valid = false;
	reply_info.msg = "No such path exists";
	return reply_info;
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
//proxy.register(host + '/log', "localhost:24224/");
