define(function(require) {
  var $ = require('jquery');
  var log = require('./../../log')('av', 'info');
  var _c = require('./av-conf');

  var ses_config = require('./config');

  $.whenall = function(arr) { return $.when.apply($, arr); };

  var av = {};
  var av_modules = [];
  var av_conf = {};

  av.init = function (_framework, custom, perms) {
    log.info ('av.init called');

    var _d = $.Deferred();

    __load(ses_config)
      .then ( __init, fail )
      .then ( s , fail)
      ;

    function s () {
      log.info('__init success');
      return _d.resolve();
    }

    function fail (err) {
      log.error ('fatal : ' + err);
      _d.reject(err);
    }

    return _d.promise();
  };

  av.start = function (module) {
    var _d = $.Deferred();
    log.info('av.start called');
    av_modules[0].handle.start()
      .then ( _d.resolve, _d.reject )
      ;
    return _d.promise();
  };

  av.stop = function (module) {
    var _d = $.Deferred();
    log.info('av.stop called');
    av_modules[0].handle.stop()
      .then ( _d.resolve, _d.reject )
      ;
    return _d.promise();
  };

  /*
   * ----------- private functions ------------
   */

  __load = function ( ses_config ) {
    log.info('inside av.__load');

    var _d = $.Deferred();
    var _d_arr = [];

    log.info(JSON.stringify(ses_config));
    var resources = ses_config.resources;

    for ( var i = 0; i < resources.length; i++ ) {
      if ( resources[i].name === 'av' ) {
        log.info('Av info: ' + JSON.stringify(resources[i]));
        _d_arr.push(__loadfile(resources[i]));
      }
    }

    $.whenall(_d_arr)
      .then(function() { _d.resolve(av_conf); });

    return _d.promise();
  };

  function __loadfile ( av_config ) {
    log.info('__loadfile Av info: ' + JSON.stringify(av_config));
    var _d = $.Deferred();
    /* file name from config */
    var file = av_config.custom.server.name;
    require([ file ],
        function (arg) {
          var av_module = {
            name : file,
            handle : arg
          };

          av_modules.push(av_module);
          av_conf = av_config;
          __saveavconfig(av_config);

          log.info ('loaded module: ' + file +  ' calling _d.resolve with arg: ' + JSON.stringify(av_config));

          _d.resolve(av_config);
        },
        function (err) {
          log.error ('could not load module', file, ':reason', err);
          _d.reject();
        }
        );

    return _d.promise();
  }

  __saveavconfig = function ( avconfig ) {
    _c.setav (avconfig);
  };

  __init = function ( av_config ) {
    log.info('inside av.__init. config: ' + JSON.stringify(av_config));

    var _d = $.Deferred();

    var _d_arr = [];

    for ( var i = 0; i < av_modules.length; i++ ) {
      _d_arr.push(__initmodule(av_modules[i]), av_config);
    }

    $.whenall(_d_arr).then(
        function () {
          log.info ('init_av_modules finished');
          _d.resolve();
        },
        function () {
          var e = 'init_av_modules - some modules failed to initialize';
          log.error (e);
          _d.reject(e);
        }
        );

    return _d.promise();
  };

  function __initmodule ( module ) {
    log.info('calling ot.init api with conf: ' + JSON.stringify(av_conf));
    return module.handle.init(av_conf);
  }

  return av;
});

