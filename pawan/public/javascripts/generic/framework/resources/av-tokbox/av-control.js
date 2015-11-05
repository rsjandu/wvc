/*
 * AV resource control. UI part
 */
define(function(require) {
  var $ = require('jquery');
  var log = require('log')('av-control', 'info');
  var otd = require('ot-layout');

  var avc = {};
  var layout = false;

  var avcontainer = document.getElementById('widget-av');
  var pubsc = document.getElementById('widget-av');
  var subsc = document.getElementById('widget-av');

  /* TODO We want this object for on the fly video resizing */
  window.onresize = __resize;

  function __resize() {
    if ( layout ) {
      avc.layout();
    }
  }

  avc.init = function(display_spec, handle) {
    var _d = $.Deferred();

    var anchor = display_spec.anchor;
    $(anchor).append(
        '<div>' +
        '<h1> AV TOKBOX </h1>' +
        '</div>'
        );

    initlayout();

    _d.resolve();

    return _d.promise();
  };


  /*
   * Get publisher container
   */
  avc.pubc = function () {
    return pubsc;
  };


  /*
   * Get subscribers container
   */
  avc.subc = function () {
    return subsc;
  };


  avc.createpubd = function () {
    createD();
  };


  avc.createsubd = function () {
    createD();
  };


  avc.layout = function () {
    otd.layout();
  };


  function initlayout () {
      var lo = {
        bigFirst    : false,
        fixedRatio  : true,
        animate     : true,
        easing      : 'swing'
      };

      /* TODO */

      otd.initLayoutContainer(avcontainer, lo);
      layout = true;
  }


  function createD() {
    /*
       var remotes = document.getElementById('remoteVideos');
       if (remotes) {
       console.log('found remote videos div in html');
       var container = document.createElement('div');
       container.className = 'videoContainer';
       container.id = 'container_' + 'dsvcsvs';
       container.appendChild(video);
       remotes.appendChild(container);
       }
    */

    /*
       subscriberDiv = document.createElement('div');
       subscriberDiv.setAttribute('id', 'stream' + ev.stream.streamId);
       subscriberDiv.setAttribute('style','display:inline-block;');
       div.appendChild(subscriberDiv);
    */
  }

  /* return the object */
  return avc;
});
