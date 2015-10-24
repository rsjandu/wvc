define([
	'./ot-wrap',
	'jquery',
	'log',
	'framework',
	'./av-conf',
	'./av-res',
	'./av-control',
], function(OT, $, __log, framework, config, videores, avc) {

  var log = __log('av-tokbox', 'info');
  var f_handle = framework.handle ('av-tokbox');

  var ot = {};

  var _ses_info = {};
  var c = {};
  var _ses = {};
  var numusers = 0;
  var publisher;
  var subs = [];
  var classid = null;
  var tk;
  var otc;


  ot.init = function (display_spec, custom, perms) {
    var _d = $.Deferred();

    log.info ('av-ot init called');

    c = {
      display_spec  : display_spec,
      custom        : custom,
      perms         : perms
    };

    config.setav(c);

    avc.init(display_spec, f_handle)
      .then (_d.resolve, _d.reject)
      ;

    return _d.promise();
  };


  ot.start = function ( ses_info ) {
    var _d = $.Deferred();
    log.info ('ot.start: ', ses_info);

    _ses_info = ses_info;

    __initialize (ses_info)
      .then ( __connect, _d.reject )
      .then ( __start_publish, _d.reject )
      .then ( _d.resolve, _d.reject )
      ;
    return _d.promise();
  };


  /* av resource stop */
  ot.stop = function () {
    var _d = $.Deferred();
    log.info('ot.stop called');
    unpublish();
    unsubscribe();
    disconnect();
    _d.resolve();
    return _d.promise();
  };


  ot.deinit = function ( ) {
    var _d = $.Deferred();
    _d.resolve();
    return _d.promise();
  };


  /*
   * --- private functions ---
   */

  function disconnect() {
    _ses.disconnect();
  }


  function unpublish() {
    if ( publisher ) {
      _ses.unpublish(publisher);
      publisher.destroy();
      publisher = null;
    }
  }


  function unsubscribe() {
    /* TODO remove subscribers if any
    */
  }


  __initialize = function () {
    var _d = $.Deferred();
    __initOT()
      .then ( s, fail )
      ;

    function s () {
      log.info('initOT success');
      _d.resolve();
    }

    function fail ( error ) {
      log.error('initOT failed with error: ' + error);
      _d.reject();
    }

    return _d.promise();
  };


  function __initOT () {
    var _d = $.Deferred();

    var sessionid = _ses_info.sessionid;
    tk = _ses_info.token;
    var _k = _ses_info.key;
    var classid = _ses_info.classid;
    var username = _ses_info.username;
    var authid = _ses_info.authid;

    var session;

    if ( OT.checkSystemRequirements() === 1 ) {
      log.info('calling init session');
      session = OT.initSession(_k, sessionid);
      _ses = session;
      __ses_handlers();

      log.info('__initOT calling resolve');
      _d.resolve();
    } else {
      /* TODO: update status message
       * _ui_msg();
       */
      var err = 'WebRTC not supported on this browser ? Please check';
      showMessage(err);
      _d.reject(err);
    }

    return _d.promise();
  }


  __connect = function ( t ) {
    log.info('__connect called');
    var _d = $.Deferred();
    /* TODO both init publisher and connect could be done in parallel
     * when both operations are successful, then we are ready to publish stream
     */
    __ses_connect (t || tk)
      .then ( __init_pub, _d.reject )
      .then ( s , f )
      ;

    function s () {
      log.info('__connect success ! return resolve');
      _d.resolve();
    }

    function f (e) {
      log.error('__init_pub failed');
      _d.reject(e);
    }

    return _d.promise();
  };


  __start_publish = function () {
    log.info('__start_publish called.');
    var _d = $.Deferred();
    _ses.publish(publisher, function (err) {
      if ( err ) {
        if ( err.code === 1553 || (err.code === 1500 && err.message.indexOf('Publisher PeerConnection Error:') >= 0) ) {
          showMessage('Streaming connection failed. This could be due to a restrictive firewall.');
        } else {
          showMessage('An unknown error occurred while trying to publish your video. Please try again later.');
        }
        publisher.destroy();
        publisher = null;
        log.error(err);
        _d.reject(err);
      } else {
        log.info('Publishing a stream.');
        _d.resolve();
      }
    });
    return _d.promise();
  };


  /*
   * publisher init code.
   * get device, set video opts and div etc.
   * stream is not started here
   */
  __init_pub = function () {
    log.info('av __init_pub called');

    var _d = $.Deferred();

    if ( !__ispublisher() || _ses.capabilities.publish !== 1 ) {
      log.info('configured to be a subscriber');
      log.info('Client not a publisher, else check device availability');
      _d.resolve();
      return _d.promise();
    }

    /*
     * publisher
     */
    var container = null;
    var options = null;
    __get_device ()
      .then ( __ot_initpub, fail )
      .then ( s, fail )
      ;

    function s () {
      log.info('__ot_initpub success ! return resolve');
      _d.resolve();
    }

    function fail (e) {
      log.info('__init_pub failed with: ' + e);
      _d.reject(e);
    }

    return _d.promise();
  };


  __get_device = function () {
    log.info('__get_device');
    var _d = $.Deferred();

    var audioInputDevices;
    var videoInputDevices;

    /*
     * TODO return device capabilities in resolve.
     * This function might not be needed.
     *
     OT.getDevices( function (error, devices ) {
     audioInputDevices = devices.filter(function (element) {
     return element.kind == 'audioInput';
     });
     videoInputDevices = devices.filter(function (element) {
     return element.kind == 'videoInput';
     });

     for ( var i = 0; i < audioInputDevices.length; i++ ) {
     log.info('audio input device: ', audioInputDevices[i].deviceId);
     }
     for ( i = 0; i < videoInputDevices.length; i++ ) {
     log.info('video input device: ', videoInputDevices[i].deviceId);
     }
     });
     */

    _d.resolve();

    return _d.promise();
  };


  __ot_initpub = function ( device, container, opt ) {
    var _d = $.Deferred();
    var options = {};
    var div = null;

    if ( __conftype() == 'audiovideo' ) {
      div = avc.pubc();
      //div = document.getElementById('pubscontainer');

      options.publishAudio = true;
      options.publishVideo = true;
      options.insertMode = 'append';
      options.resolution = __getvideores();
      options.name = 'saurabh';
      options.width = '100%';
      options.height = '100%';

      log.info('video res: ' + options.resolution);
    } else {
      /*
       * audio only session, set videoSource to null or false.
       * this would ask only for a mic and not camera
       */
      options.videoSource = null;
    }
    /* TODO delete
     * avc.createPubC();
     */
    publisher = OT.initPublisher(div, options, function (err) {
      if ( err ) {
        /* The client cannot publish. You may want to notify the user */
        if ( err.code === 1500 && err.message.indexOf('Publisher Access Denied:') >= 0 ) {
          /* Access denied can also be handled by the accessDenied event */
          showMessage('Please allow access to the Camera and Microphone and try publishing again.');
        } else {
          showMessage('Failed to get access to your camera or microphone. Please check that your webcam is connected and not being used by another application and try again.');
        }
        publisher.destroy();
        publisher = null;
        _d.reject('initPublisher failed with: ' + error);
      } else {
        log.info('Publisher initialized.');
        pub_handlers();
        _d.resolve();
      }
    });

    return _d.promise();
  };


  function pub_handlers () {
    publisher.on({
      accessAllowed : function (ev) {
        log.info('The user has granted access to the camera and mic');
      },
      accessDenied : function accessDeniedHandler (ev) {
        log.info('user has denied access to the camera and mic. Please allow access to the camera and microphone and try publishing again');
      },
      accessDialogOpened : function (ev) {
        log.info('The allow/deny dialog box is opened.');
        pleaseAllowCamera.style.display = 'block';
      },
      accessDialogClosed : function (ev) {
        log.info('The allow/deny dialog box is closed.');
      }

    });

    /* different style mix ;)  be consistent ! */
    publisher.on('streamCreated', function (ev) {
      log.info('streamCreated event. The publisher started streaming.');
      if ( ev.stream.hasVideo ) {
        avc.layout();
      }
    });

    publisher.on('streamDestroyed', function (ev) {
      /*
       * By default, when a streamDestroyed event is sent for your Publisher, the Publisher is destroyed and removed from the HTML DOM. You can prevent this default behavior by calling the preventDefault() method of the StreamEvent object
       * You may want to prevent the default behavior, and retain the Publisher, if you want to reuse the Publisher object to publish again to the session.
       */
      /*
       * ev.reason values :
       *  'clientDisconnected',
       *  'forceDisconnected',
       *  'forceUnpublished', or
       *  'networkDisconnected'.
       *  For details, see StreamEvent
       */
      if ( ev.reason === 'networkDisconnected' ) {
        showMessage('Your publisher lost its connection. Please check your internet connection and try publishing again.');
      } else {
        //ev.preventDefault();
        log.info('The publisher stopped streaming. Reason: ' + ev.reason);
      }
      if ( ev.stream.hasVideo ) {
        avc.layout();
      }
    });
    /*
       The Publisher also dispatches a destroyed event when the object has been removed from the HTML DOM.
       In response to this event, you may choose to adjust (or remove) DOM elements related to the publisher that was removed.
    */
  }

  /*
     ---- Stopping a publisher from streaming to a session ----
     You can stop publisher from streaming to the session by calling the unpublish() method of the Session object:

     session.unpublish(publisher);

     ----- Note that you can individually stop sending video or audio (while still publishing). See below -----

     once a publisher object is created media can be toggled via simple APIs.
     These would result in a streamPropertyChanged event on the session object for all connected clients
     publisher.publishAudio(false);
     publisher.publishAudio(true);
     publisher.publishVideo(false);
     publisher.publishVideo(true);
     */


  /*
   * TODO we can place all helper functions in a central place or different file later
   */
  function __conftype () {
    return config.getConfType();
  }


  function __getvideores () {
    var res = config.getVideoRes();
    if ( res === 'hd' ) return videores.ot.hd;
    if ( res === 'vga' ) return videores.ot.vga;
    if ( res === 'qvga' ) return videores.ot.qvga;
  }


  /*
   * read from config
   */
  function __ispublisher () {
    return config.isPublisher();
  }


  /*
   * arg val : true or false
   * call whenever a user is allowed to publish.
   * mutable : yes. changes config value
   */
  function __setpublisher ( val ) {
    config.setPublisher(val);
  }


  function __ses_connect (t) {
    var _d = $.Deferred();
    _ses.connect (t, function (err) {
      if ( err ) {
        log.error('Failed to connect.');
        if ( err.code === 1006 ) {
          log.error('Failed to connect. Please check your connection and try connecting again.');
        } else if ( err.code === 1004 ) {
          log.error('Failed to connect. Authentication error. Token expired. Try connecting again');
        } else {
          log.error('An unknown error occurred connecting. Please try again later. err.code: ' + err.code);
        }
        _d.reject('av session connect failed with ' + err.code);
      } else {
        log.info('You are connected to the av session.');
        _d.resolve();
      }
    });

    return _d.promise();
  }


  function __ses_handlers () {
    _ses.on({

      connectionCreated : function (ev) {
        numusers++;
        if ( ev.connection.connectionId !== _ses.connection.connectionId ) {
          log.info('session connectionCreated event. Another client connected. ' + numusers + ' total.');
        }
      },

    connectionDestroyed : function connectionDestroyedHandler (ev) {
      numusers--;
      log.info('session connectionDestroyed event. A client disconnected. ' + numusers + ' total.');
    },

    sessionConnected : function (ev) {
      log.info('session sessionConnected event');
    },

    /* self disconected */
    sessionDisconnected : function sessionDisconnectHandler (ev) {
      log.info('session sessionDisconnected event');
      /*
       * The ev is defined by the SessionDisconnectEvent class
       */
      if ( ev.reason === 'networkDisconnected' ) {
        /* TODO take action */
        sendMessage('Internet connection is probably lost. Please check your connection and try connecting again.');
      }
    },

    streamCreated : function (ev) {
      log.info('session streamCreated event');
      /* var options = {
       * subscribeToAudio : true,
       * subscribeToVideo :false,
       * audioVolume : 10 // Set a value between 0 (silent) and 100 (full volume)
       * };
       */
      var options = {};
      var div = null;

      var getSubsContainer = function (id) {
          parentDiv = document.getElementById('subscontainer');
          subscriberDiv = document.createElement('div');
          subscriberDiv.setAttribute('id', 'stream' + id);
          subscriberDiv.setAttribute('style','display:inline-block;');
          parentDiv.appendChild(subscriberDiv);
          return subscriberDiv;
      };

      if ( ev.stream.hasVideo ) {
        log.info('session streamCreated event. Has Video');
        //div = getSubsContainer(ev.stream.streamId);
        div = avc.subc(ev.stream.streamId);
        options.insertMode = 'append';
        options.width = '100%';
        options.height = '100%';
      } else {
        log.info('session streamCreated event with only audio.');
      }

      var sub = _ses.subscribe(ev.stream, div, options);
      //var sub = _ses.subscribe( ev.stream, div.id, options );
      sub.on('videoDisabled', function (ev) {
        log.info('videoDisabled event on id : ' + sub.id);
        log.info('videoDisabled event reason : ' + ev.reason);
        /* You may want to hide the subscriber video element:
           domElement = document.getElementById(sub.id);
           domElement.style['visibility'] = 'hidden';
           You may want to add or adjust other UI.
        */
      });
      sub.on('videoEnabled', function (ev) {
        log.info('videoEnabled event on id : ' + sub.id);
        log.info('videoEnabled event reason : ' + ev.reason);
        /* You may want to show the subscriber video element:
           domElement = document.getElementById(sub.id);
           domElement.style['visibility'] = 'visible';
           You may want to add or adjust other UI.
        */
      });

      /* TODO  save sub object */
      var connectionid = ev.stream.connection.connectionId ;
      var streamid = ev.stream.streamId ;
      log.info('incoming stream streamid: ' + ev.stream.streamId);
      log.info('incoming stream connectionid: ' + ev.stream.connection.connectionId);

      avc.layout();
    },

    streamDestroyed : function (ev) {
      log.info('session streamDestroyed event');
      if ( ev.stream.hasVideo ) {
        log.info('session streamDestroyed event. has video');
        avc.layout();
      }
    },

    /*
     * streamPropertyChanged ev is rxd when a pub toggles her a/v on-off.
     */
    streamPropertyChanged : function (ev) {
      log.info('session streamPropertyChanged event');
      /* get a list of subscribers for a stream */
      var subs = _ses.getSubscribersForStream(ev.stream);
      for ( var i = 0; i < subs.length; i++ ) {
      }
    },

    });

    /*
     * CCAA: Once subscribed to another stream, its a/v can be toggled easily.
     * subscriber.subscribeToAudio(true/false); // audio on off
     * subscriber.subscribeToVideo(true/false); // video on off
     * Volume control - subscriber.setAudioVolume(0); (silent. also via UI controls for sub)
     */
  }


  function showMessage ( m ) {
    log.info(m);
    avc.showMessage(m);
    /* TODO raise an event or show connection status */
  }


  function send_audio_mute () {
    f_handle.send_command ('*', 'audio.mute', 'on')
      .then (
          function (data) {
            log.info ('send_audio_must: on: ok', data);
          },
          function (err) {
            log.error ('send_audio_must: on: err: ' + err);
          }
          );
  }

  return ot;

});
