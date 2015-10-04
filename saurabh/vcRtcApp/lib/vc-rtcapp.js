/* TODO - Rest API for class creation. userRole, numUsers, audio, audio-video, HD, lock/unock room. default resolution. default layout, maximize resolution,
 * To begin with, this class configuration can be stored in a config file.
 * Num moderators = 2
 * define API and error codes when Num mod > 2. Check for total number of users.
 * States - scheduled, started, finished, etc.
 * Storage object for database.
 * Config file for config.
 * Send signal like HUP and reload config which do not require restarts.
 * Few config changes like address, etc would require a restart
 * Process related handling - exceptions and signals.
 * All code to be async (callbacks on completion) for any IO (file and network).
 * Put CPU or memory intensive tasks in separate threads or process
 * Logging in async way. Log Store could be MongoDB
 * In memory session database - Redis.
 * Socket.io messages - userId, connectionId, streamId
 * push server room config to client side after token access is granted. user granted access to room. connected, disconnected, stream publish, unpublish, video maximise, resize, A/V mute, unmute.
 * Define client side actions and events in server and save in DB with timestamp
 * var ev = { roomId, userId, connectionId, streamId, evType, date, description, severity }
 * UI side - All this would trigger a socketIo event from JS to NJS.
 * Mute / Unmute self.
 * Publisher - publish and unpublish his streams.
 * MODERATOR will have additional functionalities mentioned below:
 * Start class. Before that nobody can enter class.
 * Stop class. Should result in class termination and cleanups. SockIO broadcast hangup or stop class.
 * Lock class.
 * Unlock class.
 * Maximize self.
 * Maximize other user. Would result in an ev broadcast. Stop and republish stream.
 * Remove a user.
 * Stop start remote audio and video.
 */


/* Define modules
*/

var uuid = require('node-uuid');

var logger = require('./logger.js');
var conf = require('./../conf/config.js');

var log = logger.getLogger('vcRtcApp');

//------------
// uuid.v4()
log.info('hi');

/*
 * Entry function for all socket related activities.
 */
exports.start = function start(expressApp, io, options) {
  log.info('start function called');

  io.of('/vcRtc')
    .on('connection', function onMessage(socket) {
      log.info('socketio connection received from socketid: %s\n', socket.id);

      socket.emit('news', { hello: 'world' });

      // TODO room could be class-identifier rxd via rest API
      socket.on('enterRoom', function(data) {
        // FIXME remove the hardcode. Store the room session in mem database.
        var room = 'vcDemoRoom';
        // join a room
        socket.join(room);
        io.sockets.in(room).emit('message', 'user entered room');
      });

      socket.on('leaveRoom', function(room) {
        // Leave the room and join room given as arg
        if (socket.room) {
          socket.leave(socket.room);
          io.sockets.in(room).emit('message', 'user left room');
        }
        // move user to a new room if required.
        if (room) {
          socket.room = room;
          socket.join(room);
        }
      });

      socket.on('my other event', function (data) {
        log.info(JSON.stringify(data));
      });

      // switch a room
      socket.on('room', function(room) {
        if (socket.room) {
          socket.leave(socket.room);
        }
        if (room) {
          socket.room = room;
          socket.join(room);
        }
      });

      socket.on('disconnect', function() {
        log.info('user socket disconnected');
        // TODO connection cleanup.
        // remove from room
      });

    });
};

