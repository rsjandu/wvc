



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
	var key = req.body.key;
	var value = req.body.value;
	log.info('proxy_api registered route');
	log.info("key="+key + "::value=" + value);
	var Validity = checkrequest(key, value, "r");
	if (Validity.valid) {
		if(Validity.reset){
			proxy.unregister (host + key);
			proxy.register (host + key, value);
		}
		else {
			proxy.register(host + key , value);
		}
		res.sendStatus(200);
	}
	else{
		res.sendStatus(Validity.httpstatus);//.json({message : Validity.msg});
	}
};


proxy_api.unregister = function (req, res, next) {
	var key = req.body.key;
	var value = req.body.value;
	log.info('proxy_api unregistered route');
	log.info("key="+key + "::value=" + value);
	var Validity = checkrequest(key, value, "ur");
	if (Validity.valid){
		proxy.unregister(host + key);
		res.sendStatus(200);
	}
	else{
		res.sendStatus(Validity.httpstatus)//.json({message : Validity.msg});
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


function checkrequest (key, value, type){
	var reply_info = {};
	var proxy_paths = proxy.routing[host];
	for (var i=0; i<proxy_paths.length ; i++){
		if (proxy_paths[i].path === key){
			if (proxy_paths[i].urls[0].href === value){
				if (type === "r"){
					log.info("Route already registered");
					reply_info.valid = false;
					reply_info.msg = "Route already registered";
					reply_info.httpstatus = 200;
				}
				/*else{
				  log.info("Unregister the route");
				  reply_info.valid = true;
				  }*/
			}
			else{
				if (type === "r"){
					log.info("Trying to register a different value for an existing key");
					reply_info.valid = true;
					reply_info.reset = true;
				}
				/*else{
				  log.info("Trying to unregister wrong path");
				  reply_info.valid = false;
				  reply_info.msg = "Unregistering wrong path";
				  reply_info.httpstatus = 404;
				  }*/
			}
			if(type === "ur"){
				reply_info.valid = true;
			}
			return reply_info;
		}
	}
	if (type === "r"){
		log.info("Registering the route");
		reply_info.valid = true;
	}
	else{
		log.info("No such proxy entry exists with this "+ key +":" + value+"pair");
		reply_info.valid = false;
		reply_info.msg = "No such proxy entry exists with this "+ key +":" + value+"pair";
		reply_info.httpstatus = 404;
	}
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
proxy.register(host + '/', "localhost:5000/");
proxy.register(host + '/socket.io/', "localhost:5000/socket.io/");
proxy.register(host + '/log', "localhost:24224/");
