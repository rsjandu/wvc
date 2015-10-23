requirejs.config({
  baseUrl: '/javascripts/generic/framework/resource/av',
  shim : {
    'tbjs': {
    'exports': 'OT'
  }
},

paths: {
  /* the left side is the module ID,
   * the right side is the path to
   * the jQuery file, relative to baseUrl.
   * Also, the path should NOT include
   * the '.js' file extension.
   * */
  jquery : '/javascripts/ext/jquery-1.11.3.min',
  tbjs : '//static.opentok.com/v2/js/opentok.min'
}
});

define(function(require) {
  var $ = require('jquery');
  var log = require('../../log')('av', 'info');
  var xhr = require('../../xhr');
  var config = require('get-config');
  var OT = require('tbjs');
  var c = require('av-conf');
  var videores = require('av-res');

  /*
   * global vars
   */
  var ot = {};
  /* av resource config */
  var _c = {};
  var _ses = {};
  var numusers = 0;
  /* publisher object */
  var publisher;
  var subs = [];
  var streams = [];
  var classid = null;
  var tk;
  var avcontainer;
  var otc;

  /* TODO We want this object for on the fly video resizing */
  window.onresize = __resize;

  function __resize() {
    if ( otc ) {
      otc.layout();
    }
  }

  /*
   * ------------- Methods -------------
   */


  /* init - entry point of ot.js
   * conf : Big JSON string containing configuration of audio video resource
   * and user info
   */
  ot.init = function ( conf ) {
    _c = conf;
    log.info('ot.init with conf: ' + JSON.stringify(conf));
    log.info('ot.init with conf via required AMD: ' + JSON.stringify(c.av));
    classid = _c.custom.config.classid;

    var _d = $.Deferred();
    __initialize (_c)
      .then (success, fail);

    function success () {
      log.info('__initialize success. return resolve');
      _d.resolve(conf);
    }

    function fail () {
      _d.reject();
    }

    return _d.promise();
  };

  function init_otc() {
    var opts = {
      fixedRatio: true,
      animate: true,
      bigClass: 'OT_big',
      bigPercentage: 0.85,
      bigFixedRatio: false,
      easing: 'swing'
    };

    return initLayoutContainer(document.getElementById('subscribersContainer'), opts);
  }

  /*
   * start api. to be called on class start.
   * this is the time when user would start publish and subscribe
   */
  ot.start = function ( ) {
    var _d = $.Deferred();
    log.info('ot.start called');
    __connect ()
      .then ( __start_publish, _d.reject )
      .then ( _d.resolve, _d.reject )
      ;
    return _d.promise();
  };

  ot.stop = function ( ) {
    var _d = $.Deferred();
    log.info('ot.stop called');
    _ses.unpublish(publisher);
    publisher.destroy();
    disconnect();
    _d.resolve();
    return _d.promise();
  };

  ot.deinit = function ( ) {
    var _d = $.Deferred();
    _d.resolve();
    return _d.promise();
  };

  /* disconnect an av session */
  function disconnect() {
    _ses.disconnect();
  }

  /*
   * --- private functions ---
   */
  __initialize = function () {

    /* get class session id and media id from server
     * then get token
     * check system requirements
     * init code
     * init publisher
     */
    var _d = $.Deferred();
    config.getsessionid(_c)
      .then ( config.gettoken, sesfail )
      .then ( __initOT, tokenf )
      .then ( s, otf )
      ;

    function s () {
      log.info('__initOT success ! return resolve');
      _d.resolve();
    }

    function sesfail () {
      log.info('ot connect error');
      _d.reject();
    }

    function tokenf ( res ) {
      log.info('ot get token failed.');
      _d.reject();
    }

    function otf ( res ) {
      log.info('otinit failed.');
      _d.reject();
    }

    return _d.promise();
  };


  function __initOT (res) {
    log.info('__initOT called with: ' + JSON.stringify(res));
    var _d = $.Deferred();

    var classid = res.classId;
    var userid = res.userId;
    var sessionid = res.mediaRoomId;
    var _t = res.t;
    tk = res.t;
    var _k = res.k;

    var session;

    if ( OT.checkSystemRequirements() === 1 ) {
      log.info('calling init session');
      session = OT.initSession(_k, sessionid);
      _ses = session;
      __ses_handlers();

      var lo = {
        bigFirst : false,
        fixedRatio : true,
        animate : true,
        easing : 'swing'
      };

      /* streams container is one big container for all av streams */
      avcontainer = document.getElementById('subscribersContainer');
      otc = initLayoutContainer(avcontainer, lo);

      /* do not resolve if we were to connect to session below */
      log.info('__initOT calling resolve');
      _d.resolve();
    } else {
      /* TODO: update status message
       * _ui_msg();
       */
      _d.reject('WebRTC not supported on this browser ? Please check');
    }


    function s () {
      log.info('__initOT success ! return resolve');
      _d.resolve();
    }

    function fail (e) {
      log.error('__initOT failed with: ' + e);
      return _d.reject(e);
    }

    log.info('__initOT return promise');
    return _d.promise();
  }


  __connect = function (t) {
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
      .then ( _d.resolve, fail )
      ;

    function fail (e) {
      log.info('__ot_initpub fail: ' + e);
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
     * TODO return device capabilities in resolve. This function might not be needed.
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
      div = document.getElementById('publisherContainer');
      div.setAttribute('style','display:inline-block;');
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
        ev.preventDefault();
        log.info('The publisher stopped streaming. Reason: ' + ev.reason);
      }
    });
    /*
       The Publisher also dispatches a destroyed event when the object has been removed from the HTML DOM. In response to this event, you may choose to adjust (or remove) DOM elements related to the publisher that was removed.
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
   * we can place all helper functions in a central place or different file later
   */
  function __conftype () {
    return c.av.custom.config.conftype;
  }

  function __getvideores () {
    var res = c.av.custom.config.videores;
    if ( res === 'hd' ) return videores.ot.hd;
    if ( res === 'vga' ) return videores.ot.vga;
    if ( res === 'qvga' ) return videores.ot.qvga;
  }
  /*
   * read from config
   */
  function __ispublisher () {
    return c.av.custom.config.publish;
  }

  /*
   * arg val : true or false
   * call whenever a user is allowed to publish.
   * mutable : yes. changes config value
   */
  function __setpublisher ( val ) {
    c.av.custom.config.publish = val;
  }


  function __ses_connect (t) {
    var _d = $.Deferred();

    _ses.connect (t, function (err) {
      log.info('calling ot connect');
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
        numusers++;
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

      if ( ev.stream.hasVideo ) {
        parentDiv = document.getElementById('subscribersContainer');
        subscriberDiv = document.createElement('div');
        subscriberDiv.setAttribute('id', 'stream' + ev.stream.streamId);
        subscriberDiv.setAttribute('style','display:inline-block;');
        parentDiv.appendChild(subscriberDiv);
        options.width = '100%';
        options.height = '100%';
        /*
         * options.insertMode = 'append';
         */
        log.info('video res: ' + options.resolution);

      } else {
        log.info('session streamCreated event with only audio.');
      }
      /*
       * var subscriber = _ses.subscribe( ev.stream, parentDiv, options );
       */
      var subscriber = _ses.subscribe( ev.stream, subscriberDiv.id, options );
      subscriber.on('videoDisabled', function (ev) {
        log.info('videoDisabled event on id : ' + subscriber.id);
        log.info('videoDisabled event reason : ' + ev.reason);
        /* You may want to hide the subscriber video element:
           domElement = document.getElementById(subscriber.id);
           domElement.style['visibility'] = 'hidden';
           You may want to add or adjust other UI.
           */
      });
      subscriber.on('videoEnabled', function (ev) {
        log.info('videoEnabled event on id : ' + subscriber.id);
        log.info('videoEnabled event reason : ' + ev.reason);
        /* You may want to show the subscriber video element:
           domElement = document.getElementById(subscriber.id);
           domElement.style['visibility'] = 'visible';
           You may want to add or adjust other UI.
           */
      });

      otc.layout();
      /* TODO  save sub object */
    },

    streamDestroyed : function (ev) {
      log.info('session streamDestroyed event');
      otc.layout();
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
    /* TODO raise an event or display for connection status */
  }


  /*
   * otlayout functionality. separate file.
   * */
  var positionElement = function positionElement(elem, x, y, width, height, animate) {
    var targetPosition = {
      left: x + 'px',
      top: y + 'px',
      width: width + 'px',
      height: height + 'px'
    };

    var fixAspectRatio = function () {
      var sub = elem.querySelector('.OT_root');
      if (sub) {
        /* If this is the parent of a subscriber or publisher then we need
         * to force the mutation observer on the publisher or subscriber to
         * trigger to get it to fix it's layout
         */
        var oldWidth = sub.style.width;
        sub.style.width = width + 'px';
        /* sub.style.height = height + 'px'; */
        sub.style.width = oldWidth || '';
      }
    };

    if (animate && $) {
      $(elem).stop();
      $(elem).animate(targetPosition, animate.duration || 200, animate.easing || 'swing', function () {
        fixAspectRatio();
        if (animate.complete) animate.complete.call(this);
      });
    } else {
      /* NOTE: internal OT.$ API */
      OT.$.css(elem, targetPosition);
    }
    fixAspectRatio();
  };

  var getCSSNumber = function (elem, prop) {
    /* NOTE: internal OT.$ API */
    var cssStr = OT.$.css(elem, prop);
    return cssStr ? parseInt(cssStr, 10) : 0;
  };

  /* Really cheap UUID function */
  var cheapUUID = function() {
    return (Math.random() * 100000000).toFixed(0);
  };

  var getHeight = function (elem) {
    /* NOTE: internal OT.$ API */
    var heightStr = OT.$.height(elem);
    return heightStr ? parseInt(heightStr, 10) : 0;
  };

  var getWidth = function (elem) {
    /* NOTE: internal OT.$ API */
    var widthStr = OT.$.width(elem);
    return widthStr ? parseInt(widthStr, 10) : 0;
  };

  var arrange = function arrange(children, Width, Height, offsetLeft, offsetTop, fixedRatio, minRatio, maxRatio, animate) {
    var count = children.length,
        availableRatio = Height / Width,
        vidRatio;

    var getBestDimensions = function getBestDimensions(minRatio, maxRatio) {
      var maxArea,
          targetCols,
          targetRows,
          targetHeight,
          targetWidth,
          tWidth,
          tHeight;

      /* Iterate through every possible combination of rows and columns
       * and see which one has the least amount of whitespace
       */
      for (var i=1; i <= count; i++) {
        var cols = i;
        var rows = Math.ceil(count / cols);

        /* Try taking up the whole height and width */
        tHeight = Math.floor( Height/rows );
        tWidth = Math.floor(Width/cols);

        tRatio = tHeight/tWidth;
        if (tRatio > maxRatio) {
          /* We went over decrease the height */
          tRatio = maxRatio;
          tHeight = tWidth * tRatio;
        } else if (tRatio < minRatio) {
          /* We went under decrease the width */
          tRatio = minRatio;
          tWidth = tHeight / tRatio;
        }

        var area = (tWidth*tHeight) * count;

        /* If this width and height takes up the most space then we're going with that */
        if (maxArea === undefined || (area > maxArea)) {
          maxArea = area;
          targetHeight = tHeight;
          targetWidth = tWidth;
          targetCols = cols;
          targetRows = rows;
        }
      }
      return {
        maxArea: maxArea,
        targetCols: targetCols,
        targetRows: targetRows,
        targetHeight: targetHeight,
        targetWidth: targetWidth,
        ratio: vidRatio
      };
    };

    if (!fixedRatio) {
      vidRatio = getBestDimensions(minRatio, maxRatio);
    } else {
      /* Use the ratio of the first video element we find */
      var video = children.length > 0 && children[0].querySelector('video');
      if (video && video.videoHeight && video.videoWidth) {
        vidRatio = getBestDimensions(video.videoHeight/video.videoWidth,
            video.videoHeight/video.videoWidth);
      }
      else {
        /* Use the default video ratio */
        vidRatio = getBestDimensions(3/4, 3/4);
      }
    }

    var spacesInLastRow = (vidRatio.targetRows * vidRatio.targetCols) - count,
        lastRowMargin = (spacesInLastRow * vidRatio.targetWidth / 2),
        lastRowIndex = (vidRatio.targetRows - 1) * vidRatio.targetCols,
        firstRowMarginTop = ((Height - (vidRatio.targetRows * vidRatio.targetHeight)) / 2),
        firstColMarginLeft = ((Width - (vidRatio.targetCols * vidRatio.targetWidth)) / 2);

    /* Loop through each stream in the container and place it inside */
    var x = 0,
        y = 0;
    for (var i=0; i < children.length; i++) {
      var elem = children[i];
      if (i % vidRatio.targetCols === 0) {
        /* We are the first element of the row */
        x = firstColMarginLeft;
        if (i == lastRowIndex) x += lastRowMargin;
        y += i === 0 ? firstRowMarginTop : vidRatio.targetHeight;
      } else {
        x += vidRatio.targetWidth;
      }

      /* NOTE: internal OT.$ API */
      OT.$.css(elem, 'position', 'absolute');
      var actualWidth = vidRatio.targetWidth - getCSSNumber(elem, 'paddingLeft') -
        getCSSNumber(elem, 'paddingRight') -
        getCSSNumber(elem, 'marginLeft') -
        getCSSNumber(elem, 'marginRight') -
        getCSSNumber(elem, 'borderLeft') -
        getCSSNumber(elem, 'borderRight');

      var actualHeight = vidRatio.targetHeight - getCSSNumber(elem, 'paddingTop') -
        getCSSNumber(elem, 'paddingBottom') -
        getCSSNumber(elem, 'marginTop') -
        getCSSNumber(elem, 'marginBottom') -
        getCSSNumber(elem, 'borderTop') -
        getCSSNumber(elem, 'borderBottom');

      positionElement(elem, x+offsetLeft, y+offsetTop, actualWidth, actualHeight, animate);
    }
  };

  var filterDisplayNone = function (element) {
    /* NOTE: internal OT.$ API */
    return OT.$.css(element, 'display') !== 'none';
  };

  var layout = function layout(container, opts, fixedRatio) {
    /* NOTE: internal OT.$ API */
    if (OT.$.css(container, 'display') === 'none') {
      return;
    }
    var id = container.getAttribute('id');
    if (!id) {
      id = 'OT_' + cheapUUID();
      container.setAttribute('id', id);
    }

    var Height = getHeight(container) -
      getCSSNumber(container, 'borderTop') -
      getCSSNumber(container, 'borderBottom'),
      Width = getWidth(container) -
        getCSSNumber(container, 'borderLeft') -
        getCSSNumber(container, 'borderRight'),
      availableRatio = Height/Width,
      offsetLeft = 0,
      offsetTop = 0,
      bigOffsetTop = 0,
      bigOffsetLeft = 0,
      bigOnes = Array.prototype.filter.call(
          container.querySelectorAll('#' + id + '>.' + opts.bigClass),
          filterDisplayNone),
      smallOnes = Array.prototype.filter.call(
          container.querySelectorAll('#' + id + '>*:not(.' + opts.bigClass + ')'),
            filterDisplayNone);

          if (bigOnes.length > 0 && smallOnes.length > 0) {
            var bigVideo = bigOnes[0].querySelector('video');
            if (bigVideo && bigVideo.videoHeight && bigVideo.videoWidth) {
              bigRatio = bigVideo.videoHeight / bigVideo.videoWidth;
            } else {
              bigRatio = 3 / 4;
            }
            var bigWidth, bigHeight;

            if (availableRatio > bigRatio) {
              /* We are tall, going to take up the whole width and arrange small guys at the bottom */
              bigWidth = Width;
              bigHeight = Math.min(Math.floor(Height * opts.bigPercentage), Width * bigRatio);
              offsetTop = bigHeight;
              bigOffsetTop = Height - offsetTop;
            } else {
              /* We are wide, going to take up the whole height and arrange the small guys on the right */
              bigHeight = Height;
              bigWidth = Math.min(Width * opts.bigPercentage, Math.floor(bigHeight / bigRatio));
              offsetLeft = bigWidth;
              bigOffsetLeft = Width - offsetLeft;
            }
            if (opts.bigFirst) {
              arrange(bigOnes, bigWidth, bigHeight, 0, 0, opts.bigFixedRatio, opts.bigMinRatio, opts.bigMaxRatio, opts.animate);
              arrange(smallOnes, Width - offsetLeft, Height - offsetTop, offsetLeft, offsetTop, opts.fixedRatio, opts.minRatio, opts.maxRatio, opts.animate);
            } else {
              arrange(smallOnes, Width - offsetLeft, Height - offsetTop, 0, 0, opts.fixedRatio, opts.minRatio, opts.maxRatio, opts.animate);
              arrange(bigOnes, bigWidth, bigHeight, bigOffsetLeft, bigOffsetTop, opts.bigFixedRatio, opts.bigMinRatio, opts.bigMaxRatio, opts.animate);
            }
          } else if (bigOnes.length > 0 && smallOnes.length === 0) {
            /* We only have one bigOne just center it */
            arrange(bigOnes, Width, Height, 0, 0, opts.bigFixedRatio, opts.bigMinRatio, opts.bigMaxRatio, opts.animate);
          } else {
            arrange(smallOnes, Width - offsetLeft, Height - offsetTop, offsetLeft, offsetTop, opts.fixedRatio, opts.minRatio, opts.maxRatio, opts.animate);
          }
  };

  var initLayoutContainer = function(container, opts) {
    /* NOTE: internal OT.$ API */
    opts = OT.$.defaults(opts || {}, {
      maxRatio: 3/2,
         minRatio: 9/16,
         fixedRatio: false,
         animate: false,
         bigClass: 'OT_big',
         bigPercentage: 0.8,
         bigFixedRatio: false,
         bigMaxRatio: 3/2,
         bigMinRatio: 9/16,
         bigFirst: true
    });
    /* NOTE: internal OT.$ API */
    container = typeof(container) == 'string' ? OT.$(container) : container;

    /* TODO: should we add event hooks to external globals like this ?
     * this could be left as a responsibility of the user, and i think that would be more sound
     * the OT.onLoad() method has (publicly) undefined behavior
     */
    OT.onLoad(function() {
      layout(container, opts);
    });

    return {
      layout: layout.bind(null, container, opts)
    };
  };


  return ot;

});
