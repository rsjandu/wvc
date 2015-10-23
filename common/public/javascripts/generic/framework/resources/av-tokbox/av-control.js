/*
 * AV resource control. UI part
 */
define(function(require) {
    var $ = require('jquery');
    var log = require('log')('av-control', 'info');
    var otd = require('ot-layout');
    window.jade = require('jade');

    var avc = {};
    var layout = false;
    var display_spec = {};
    var handle = {};
    var dialog;

    var avcontainer;
    var pubsc;
    var subsc;

    window.onresize = __resize;

    function __resize() {
        if ( layout ) {
            avc.layout();
        }
    }

    avc.init = function (_display_spec, _handle) {
        var _d = $.Deferred();

        display_spec = _display_spec;
        handle = _handle;

        var anchor = display_spec.anchor;
        var template = handle.template('av-tokbox');

        if ( !template ) {
            _d.reject ('avc.init: template not found');
            return _d.promise();
        }

        $(anchor).append(template());
        pubsc = $(anchor).find('#av-primary-container')[0];
        subsc = $(anchor).find('#av-secondary-container')[0];
        dialog = $(anchor).find('#avwarn')[0];

        registerHandlers();
        initlayout(subsc);

        _d.resolve();

        return _d.promise();
    };

    avc.showMessage = function ( m ) {
        /* TODO
        var anchor = display_spec.anchor;
        var _m = '<h7>' + '' + m + '' + '</h4>';
        dialog.append(
                '<div>' +
                _m +
                '</div>'
                );
        */
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


    createpubd = function () {
        createD();
    };


    createsubd = function (id) {
        createD(id);
    };


    avc.layout = function () {
        otd.layout();
    };


    function initlayout (cont) {
        var lo = {
            bigFirst    : false,
            fixedRatio  : true,
            animate     : true,
            easing      : 'swing'
        };

        otd.initLayoutContainer(subsc, lo);
        layout = true;
    }


    function createD(id) {
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
           parentDiv = document.getElementById('subcontainer');
           */
        subscriberDiv = document.createElement('div');
        subscriberDiv.setAttribute('id', 'stream' + id);
        subscriberDiv.setAttribute('style','display:inline-block;');
        subsc.appendChild(subscriberDiv);
        log.info('appended subscriber div to container');
        return subscriberDiv;
    }

    function maximize() {
        log.info('av maximise button click');
    }

    function minimize() {
        log.info('av minimize button click');
    }

    function ondisconnect() {
        log.info('ondisconnect called.');
    }

    function registerHandlers() {
        /* $('[data-toggle="tooltip"]').tooltip();
         */
        $('#avdisconnect').click(ondisconnect);
        $('#avmax').click(maximize);
        $('#avmin').click(minimize);
    }


    /* return the object */
    return avc;
});
