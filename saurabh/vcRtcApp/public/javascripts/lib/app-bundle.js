(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

(function() {
  var _global = this;

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng;

  // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
  //
  // Moderately fast, high quality
  if (typeof(_global.require) == 'function') {
    try {
      var _rb = _global.require('crypto').randomBytes;
      _rng = _rb && function() {return _rb(16);};
    } catch(e) {}
  }

  if (!_rng && _global.crypto && crypto.getRandomValues) {
    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
    //
    // Moderately fast, high quality
    var _rnds8 = new Uint8Array(16);
    _rng = function whatwgRNG() {
      crypto.getRandomValues(_rnds8);
      return _rnds8;
    };
  }

  if (!_rng) {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var  _rnds = new Array(16);
    _rng = function() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return _rnds;
    };
  }

  // Buffer class to use
  var BufferClass = typeof(_global.Buffer) == 'function' ? _global.Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = options.msecs != null ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;

  if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else  if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});
 

  } else {
    // Publish as global (in browsers)
    var _previousRoot = _global.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _global.uuid = _previousRoot;
      return uuid;
    };

    _global.uuid = uuid;
  }
}).call(this);

},{}],2:[function(require,module,exports){

var room_join_error = {
  ROOM_LOCKED: 'locked',
  ROOM_FULL: 'roomfull',
  DUPLICATED_LOGIN: 'duplicatedLogin',
  SERVER_ERROR: 'serverError',
  VERIFICATION: 'verification',
  EXPIRED: 'expired',
  ROOM_CLOSED: 'roomclose',
  ROOM_CLOSING: 'toclose'
};

module.exports = room_join_error;

},{}],3:[function(require,module,exports){
var AVEvents = {
    ROOM_CREATED: 'av.room_created',
    ROOM_DELETED: 'av.room_deleted',
    CALL_INCOMING: 'av.callincoming',
    CALL_TERMINATED: 'av.callterminated',
    GRACEFUL_SHUTDOWN: 'av.graceful_shutdown',
    SERVER_DOWN: 'av.server_down',
    CHANGED_STREAMS: 'av.changed_streams',
    RESERVATION_ERROR: 'av.room_reservation_error',
    MESSAGE_RECEIVED: 'av.message_received',
    KICKED: 'av.kicked',
    REMOTE_STATS: 'av.remote_stats',
    USER_JOINED: 'av.user_joined',
    USER_ENTER: 'av.user_enter',
    USER_ROLE_CHANGED: 'av.user_role_changed',
    USER_LEFT: 'av.user_left',
    USER_DESTROYED: 'av.user_destroyed',
    LOCALROLE_CHANGED: 'av.localrole_changed',
    PRESENCE_STATUS: 'av.presence_status',
    DEVICE_AVAILABLE: 'av.device_available'
};

module.exports = AVEvents;

},{}],4:[function(require,module,exports){
var videoresolutions = {
    '1080': {
        width: 1920,
        height: 1080
    },
    'fullhd': {
        width: 1920,
        height: 1080
    },
    '720': {
        width: 1280,
        height: 720
    },
    'hd': {
        width: 1280,
        height: 720
    },
    '960': {
        width: 960,
        height: 720
    },
    '640': {
        width: 640,
        height: 480
    },
    'vga': {
        width: 640,
        height: 480
    },
    '360': {
        width: 640,
        height: 360
    },
    '320': {
        width: 320,
        height: 240
    },
    '180': {
        width: 320,
        height: 180
    }
};

module.exports = videoresolutions;

},{}],5:[function(require,module,exports){
var mediaStreamType = {
    VIDEO_TYPE: 'video',
    AUDIO_TYPE: 'audio'
};
module.exports = mediaStreamType;

},{}],6:[function(require,module,exports){
Av_resource = require('./av');

$( '#Start' ).click(function() {
  scheduleClass(classStarted);
});

classStarted = function () {
  // show the stop class button on class created callback.

};

$( '#Stop' ).click(function() {
  stopClass();
});

$(document).ready(function () {
  av_resource = new Av_resource();
  console.log('calling schedule class');
  av_resource.init();
});

$(window).bind('beforeunload', function () {
});


},{"./av":7}],7:[function(require,module,exports){
/*
   var socket = io.connect('http://192.168.56.101:8080/vcRtc');
   socket.on('mydata', function (data) {
   console.log(data);
   socket.emit('my other event', { my: 'data' });
   });

   socket.on('some event', function (data) {
   console.log(data);
   });
   */

// javascript client side code starts here.
// APIs
var uuid = require('node-uuid');
var random = require('./../../test/random');

function Av_resource() {
  this.apiKey = null;
  this.sessionId = null;
  this.roomId = null;
  this.roomName = null;
  this.streams = [];
  this.connections = [];
  this.publishers = [];
  this.session = null;
  this.token = null;
  this.subscribers = {};
  this.myStream = undefined;
  this.publisher = undefined;
  this.unseenCount = 0;
  this.initialized = false;
  this.recording = false;
  this.init();
  this.initOT();
  this.set_perms();
  this.start();
  this.stop();
  this.deinit();
}


Av_resource.prototype = {
  constructor: Av_resource,
  init: function(url) {
  },
  initOT : function() {
  },
  set_perms: function(permissions) { },
  start: function() { },
  /* By default, start with no permissions */
  stop: function() { },
  deinit: function() { }
};

Av_resource.prototype.init = function(url) {
  /* Get token and create sock.io */
  /* this.getConfig(); */
  this.scheduleClass();
  this.getToken();
};


Av_resource.prototype.getToken = function() {
  var params = {
    classId : this.classId,
    mediaRoomId : this.mediaRoomId,
    userRole : 'moderator',
    userName : this.userName
  };
  console.log('Sending token access req: ' + JSON.stringify(params));
  var url = getServerUrl() + '/rooms/token';
  this.requestServerInfo('POST', url, this.onToken.bind(this) , params);
};

/*
 * Separate test code to other modules
 */
Av_resource.prototype.scheduleClass = function(classId, ownerName, roomName, userRole) {
  this.reserveRoom(classId, ownerName, roomName, userRole);
};

Av_resource.prototype.reserveRoom = function(classId, ownerName, roomName, userRole) {
  var params = {
    classId : classId || generateClassId(),
    ownerName : ownerName || random.getName(),
    roomName : roomName || random.getRoomName(),
    userRole : userRole || 'moderator'
  };
  var url = getServerUrl() + '/rooms';
  this.requestServerInfo('POST', url, this.onRoomReserved.bind(this) , params);
};

Av_resource.prototype.requestServerInfo = function(method, url, callback, params) {
  var self = this;
  /*
     var triggerCallback = function triggerCallback() {
     if ( callback && typeof callback === function ) {
     callback.apply(null, arguments);
     }
     };
     */
  xhr = new XMLHttpRequest();

  xhr.setContentType = function (contentType) {
    xhr.setRequestHeader('Content-type', contentType);
  };

  xhr.onload = function () {
    var response = xhr.responseText || xhr.response;
    var status = xhr.status || 200;
    callback(status, JSON.parse(response || '{}'));
  };

  xhr.onerror = function () {
  };

  xhr.onprogress = function () {
  };

  xhr.open(method, url, true);
  if ( params ) {
    xhr.setContentType('application/json;charset=UTF-8');
    xhr.send(JSON.stringify(params));
  } else {
    xhr.send();
  }
};


/* callback for sch */
Av_resource.prototype.onRoomReserved = function(status, params) {
  if ( status === 200 ) {
    /* parse the response here */
    console.log(JSON.stringify(params));
    this.apiKey = params.apiKey;
    this.roomId = params.classId;
    this.sessionId = params.mediaRoomId;
  } else {
    console.log('room reserve fail status: ' + status);
  }
};


Av_resource.prototype.onToken = function(status, params) {
  if ( status === 200 ) {
    /* parse the response here */
    console.log(JSON.stringify(params));
    this.token = params.token;
    /*
    this.roomId = params.classId;
    this.sessionId = params.mediaRoomId;
    */
  } else {
    console.log('room reserve fail status: ' + status);
  }
};

function generateClassId() {
  var classid = uuid.v4();
  return classid;
}

function getServerUrl() {
  return window.location.origin;
}

module.exports = Av_resource;

},{"./../../test/random":9,"node-uuid":1}],8:[function(require,module,exports){
var streamEventTypes = {
    EVENT_TYPE_LOCAL_CREATED: 'stream.local_created',
    EVENT_TYPE_LOCAL_CHANGED: 'stream.local_changed',
    EVENT_TYPE_LOCAL_ENDED: 'stream.local_ended',
    EVENT_TYPE_REMOTE_CREATED: 'stream.remote_created',
    EVENT_TYPE_REMOTE_CHANGED: 'stream.remote_changed',
    EVENT_TYPE_REMOTE_ENDED: 'stream.remote_ended'
};

module.exports = streamEventTypes;

},{}],9:[function(require,module,exports){
/* Generates a random user name
 * Generates a random room name
 */

var random = {
  getRandomInt : function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  getName : function () {
    return 'User-' + this.getRandomInt(1, 1000);
  },

  getRoomName : function () {
    return 'Room-' + this.getRandomInt(1, 1000);
  }
};

module.exports = random;

},{}]},{},[2,3,7,4,5,6,8]);
