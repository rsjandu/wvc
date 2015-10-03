/* user info for A/V resource */
function User() {
  this.id = null;
  this.name = null;
  this.classId = null;
  this.confRoomId = null;
  this.defaultRole = null;
  this.currentRole = null;
  this.socketId = null;
  this.device = 'audiovideo';
  this.stream = 'audiovideo';
  this.tokenId = null;
  this.tokenExpireTime = null;
  this.isVideoMaximised = false;
  this.ip = null;
  this.deviceType = null;
  this.browserType = null;
  this.videoMute = true;
  this.audioMute = true;
}

module.exports = User;

