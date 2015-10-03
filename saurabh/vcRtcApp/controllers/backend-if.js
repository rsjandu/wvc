var async     = require('async');
var config    = require('../config');
var log       = require('../common/log');
var cache     = require('../common/cache').init('backend-if', 5*60*60*1000);
var templates = require('../controllers/templates');


/*
 * This is a interface to the actual backend. Going forward
 * the backend may reside on a different location and the
 * communication to it will be be controlled by this module.
 *
 * For now, we code the backend right here.
 *
 */

controller = {};
controller.get_config = function (sess_id, callback) {
  /*---------------------------------------
   *
   * Things to do:
   *
   * 		- If the session config is in the cache
   * 		  then return it
   *
   * 		- else load the session configuration
   * 		  from the core backend
   *
   * 		- Cache it
   *
   *--------------------------------------*/

  /* SS Begin
   * config specific to Av
   */

  var av_config = {
    maxVideo : 6,
    confType :  'audiovideo',
    defaultPublish : false,
    defaultVideoRes : 'qcif',
    hdVideo : false,
    showStats : false,
    /* av-controls. more like av-mute, remove(div would be updated.) */
    maxVideoRes : '640p',
    videolayout : 'horizontal'
  };

  var user_config = {
    name : null,
    /* userid or auth token */
    id : null,
    role : 'moderator'
  };

  var ot = {
    name    : 'ot',
    enabled : true,
    sigPort : 8080,
    sigHostname : '192.168.56.101'
  };

  var kur = {
    name    : 'kur',
    enabled : false,
    sigPort : null,
    sigHostname : null ,
    stun : null,
    turn : null
  };

  /* SS End */

  var session_config = {
    template : 'default',
    auth : {},
    session_server : {
      host : 'localhost',
      port : config.session_server.default_port,
      auth : {}
    },
    resources : [
    {
      name: 'youtube',
      display_spec: { widget: "av" },
      perms: { },
      custom: { url: 'https://youtu.be/A18NJIybVlA' },
    },
    /* SS Begin */
    {
      name: 'av',
      display_spec: { widget: 'av' },
      perms: { },
      custom: { config : av_config, user : user_config, server : ot },
    },
    /* SS End */
    {
      name: 'notify-box',
      display_spec: { widget: 'notify' },
      perms: { }
    }
    ],
  };


  callback (null, session_config);
};


module.exports = controller;
