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
    var cbs = {};
    var lvmute = false;

    window.onresize = __resize;

    function __resize() {
        if ( layout ) {
            avc.layout();
        }
    }

    avc.init = function (_display_spec, _handle, _cbs) {
        var _d = $.Deferred();

        display_spec = _display_spec;
        handle = _handle;
        cbs = _cbs;

        var anchor = display_spec.anchor;
        var template = handle.template('av-tokbox');

        if ( !template ) {
            _d.reject ('avc.init: template not found');
            return _d.promise();
        }

        $(anchor).append(template());
        //pubsc = $(anchor).find('#av-primary-outer')[0];
        pubsc = $(anchor).find('#av-primary-cont')[0];
        subsc = $(anchor).find('#av-secondary-outer')[0];
        dialog = $(anchor).find('#avwarn')[0];

        registerHandlers();
        def_pri_vid_ctrl();
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
        _l.layout_p();
        _l.layout_s();
    };


    function initlayout (cont) {
        var opt = {
            bigFirst    : false,
            fixedRatio  : true,
            animate     : true,
            easing      : 'swing'
        };

        _l = otd.initLayoutContainer(pubsc, subsc, opt);
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

    avc.usermediasuccess = function (type) {
        $('#avstart').hide();
        $('#avmic-mute').show();
        $('#avdisconnect').show();
        if ( type === 'audiovideo' ) {
            $('#avcamstop').show();
        }
    };

    avc.usermediafail = function (type) {

    };

    avc.usermediapublished = function() {

    };

    avc.usermediaunpublished = function() {

    };

    avc.disconnected = function() {
        def_pri_vid_ctrl();
        $('#avstart').show();
    };

    avc.svcstyle = function (sub) {

        var subeid = sub.element.id;
        var e = '#' + subeid;
        var secmenu = '<div id="secvidmenu" class="avsmenu" </div>';
        $(e).append(secmenu);
        var secVidMenuElemId = 'secvidmenu_' + subeid;
        $('#secvidmenu').attr('id', secVidMenuElemId);
        /*
        var vidbtn = '<div id="secvidmute" class="btn btn-default btn-sm"><span class="fa fa-video-camera"></span></div>';
        $('#' + secVidMenuElemId).append(vidbtn);
        var secVidMuteElemId = 'secvidmute_' + subeid;
        $('#secvidmute').attr('id', secVidMuteElemId);
        $('#' + secVidMuteElemId).click(secvidclick);
        var targetPosition = {
            display : 'inline-block'
        };
        $('#secvidmute').css(targetPosition);
        */
    };

    function maximize() {
        log.info('av maximise button click');
    }

    function micmute() {
        log.info('micmute button click');
        cbs.mutela();
        $('#avmic-mute').hide();
        $('#avmic-unmute').show();
    }

    function micunmute() {
        log.info('micunmute button click');
        cbs.unmutela();
        $('#avmic-unmute').hide();
        $('#avmic-mute').show();
    }

    function toggleVideo() {
        log.info('toggleVideo button click');
        if ( !lvmute ) {
            cbs.mutelv();
            $('#av-menu-outer .btn span.fa-video-camera').css('color', 'red');
        } else {
            cbs.unmutelv();
            $('#av-menu-outer .btn span.fa-video-camera').css('color', 'white');
        }
        lvmute = !lvmute;
    }

    function toggleSubVideo (id) {
        log.info('toggleSubVideo button click');
        if ( cbs ) {
            cbs.muterv(id);
        }
    }

    function start() {
        log.info('start button click');
        if ( cbs ) {
            cbs.start();
        }
    }

    function disconnect() {
        log.info('disconnect called.');
        if ( cbs ) {
            cbs.stop();
            def_pri_vid_ctrl();
            $('#avstart').show();
        }
    }

    function def_pri_vid_ctrl() {
        $('#avmax').hide();
        $('#avmic-mute').hide();
        $('#avmic-unmute').hide();
        $('#avcamstop').hide();
        $('#avstart').hide();
        $('#avdisconnect').hide();
    }

    function secvidclick() {
        log.info('secvidclick');
        var uid, ident;
        var id = $(this).attr('id');
        if ( id ) {
            ident = id.split('_')[1];
            uid = id.split('_')[2];
        }
        if ( ident && uid ) {
            if ( ident === 'RS' ) {
                toggleSubVideo('RS_' + uid);
            } else if ( ident === 'LS' ) {
                toggleVideo();
            }
        }
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
