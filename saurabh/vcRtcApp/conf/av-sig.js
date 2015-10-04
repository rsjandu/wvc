/*
 * There is going to be some information regarding which mediabox to choose from. This could reside separately in some config file/ cache/ DB. from where will it be feteched ? controllers/backend_if or our own module.  Framework needs to know about this config ?
It is possible that a customer would like to have all data in their own data center. While it might be done at the time of class config, it is very much possible that it is pre provsioned.
 */

var ot = {
  name    : 'ot',
  enabled : true,
  sigPort : 8080,
  sigHostname : '192.168.56.101'
};

var kur = {
  name    : 'kur'
  enabled : false,
  sigPort : null,
  sigHostname : null ,
  stun : null,
  turn : null
};


var av_config = {
  server : ot;
};

/* we would load JS files async accordingly. connect to its signaling server_ip ( most probably websockets or sock.io channel ).
*/

