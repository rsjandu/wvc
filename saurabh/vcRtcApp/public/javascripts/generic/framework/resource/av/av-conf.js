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

  return config;

});
