/*
 * AV resource control. UI part
 */
define(function(require) {
    var $ = require('jquery');
    var log = require('log')('av-control', 'info');
    var otd = require('./ot-layout');
    window.jade = require('jade');

    var avc = {};
    var layout = false;
    var display_spec = {};
    var handle = {};
    var dialog;

    var avcontainer;
    var pubsc;
    var subsc;
    var _l = {};

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
        pubsc = $(anchor).find('#av-primary-outer')[0];
        subsc = $(anchor).find('#av-secondary-outer')[0];
        dialog = $(anchor).find('#avwarn')[0];

        registerHandlers();
        initlayout(subsc);

        _d.resolve();

        return _d.promise();
    };

    avc.showMessage = function ( m ) {
    };


    /*
     * Get primary container
     */
    avc.pubc = function () {
        return pubsc;
    };


    /*
     * Get secondary container
     */
    avc.subc = function () {
        return subsc;
    };

    avc.layout = function () {
        _l.layout();
    };


    function initlayout (cont) {
        var opt = {
            bigFirst    : false,
            fixedRatio  : true,
            animate     : true,
            easing      : 'swing'
        };

        _l = otd.initLayoutContainer(subsc, opt);
        layout = true;
    }


    function createD(id) {
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

    function micmute() {
        log.info('micmute button click');
    }

    function micunmute() {
        log.info('micunmute button click');
    }

    function toggleVideo() {
        log.info('toggleVideo button click');
    }

    function start() {
        log.info('start button click');
    }

    function disconnect() {
        log.info('disconnect called.');
    }

    function registerHandlers() {
        $('#avmax').click(maximize);
        $('#avmic-mute').click(micmute);
        $('#avmic-unmute').click(micunmute);
        $('#avcamstop').click(toggleVideo);
        $('#avstart').click(start);
        $('#avdisconnect').click(disconnect);
        /* $('[data-toggle="tooltip"]').tooltip();
        $('.avsc').on('transitioned webkitTransitionEnd', function(e){
            _l.layout();
        });
        */
    }

    return avc;
});
