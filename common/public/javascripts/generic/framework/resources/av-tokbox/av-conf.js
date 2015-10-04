/*
 * this is main config store used at the frontend.
 * it is initialized after fetching data from backend
 * av module files can requirify and make use of config data
 */

define(function(require) {

  var config = {};

  /*
   * set config data for audio video resource
   */
  config.setav = function ( c ) {
    if ( c ) {
      config.av = c;
    }
  };

  config.getUserRole = function () {
    return config.av.custom.user.role;
  };

  config.getUserName = function () {
    return config.av.custom.user.name;
  };

  config.getConfigPort = function() {
    return config.av.custom.server.port;
  };

  config.getConfType = function () {
    return config.av.custom.config.conftype;
  };

  config.getVideoRes = function () {
    return config.av.custom.config.videores;
  };

  config.isPublisher = function () {
    return config.av.custom.config.publish;
  };

  config.setPublisher = function ( val ) {
    config.av.custom.config.publish = val;
  };


  return config;

});
