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
