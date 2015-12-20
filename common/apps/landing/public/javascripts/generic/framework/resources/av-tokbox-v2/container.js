define(function(require) {
	var $           = require('jquery');
	var log         = require('log')('av-container', 'info');

	/*------------------------------------------------------------
	 *
	 * Container life cycle:
	 *    initial +---+ connected 
	 *                     +
	 *                     |
	 *                     |--------+ error
	 *                     |
	 *                     +
	 *                  streaming
	 *
	 *-----------------------------------------------------------*/
	var states = [
		'shunya',
		'connected',
		'streaming',
		'error',
	];

	var types = [
		'primary',
		'secondary',
		'screenshare'
	];

	function set_type (type) {
		/*
		 * Type = 'primary' | 'secondary' | 'screenshare' */
		if (types.indexOf(type) == -1) {
			log.error ('unrecognized container type : ' + type);
			return;
		}

		for (var i = 0; i < types.length; i++) {

			if (type == types[i]) {
				$(this.div()).addClass('av-' + types[i]);
				continue;
			}

			$(this.div()).removeClass('av-' + types[i]);
		}

		log.info ('set type = ' + type + ', for #' + this.id());
		this.type = type;
	}

	function set_connection_id (connection_id) {
		this.conn_id = connection_id;
	}

	function stream_created (type, stream_) {
		/* Do some formattig stuff here */
		this.stream = stream_;
	}

	function stream_destroyed (type, stream) {
		/* Do some formattig stuff here */
	}

	function giveup () {
		var div = $(this.div());

		if (!div.hasClass('av-shunya'))
			div.removeClass('av-shunya');

		if (div.hasClass('av-visible'))
			div.removeClass('av-visible');
		if (div.hasClass('av-connected'))
			div.removeClass('av-connected');
		if (div.hasClass('av-streaming'))
			div.removeClass('av-streaming');
		if (div.hasClass('av-error'))
			div.removeClass('av-error');

		this.type    = null;
		this.state   = 'initial';
		this.conn_id = null;
		this.stream  = null;
	}

	function show_error (error) {
		$(this.div()).append('<span></span>');
		$(this.div()).addClass('av-error');
		var span = $(this.div()).find('span');
		span.addClass('av-error');

		this.state = 'error';

		/* TODO : Add a tooltip indicating the error string */
	}

	function reveal () {
		var div = $(this.div());

		if (!div.hasClass('av-visible'))
			div.addClass('av-visible');

		if (div.hasClass('av-shunya'))
			div.removeClass('av-shunya');
	}

	function conceal () {
		var div = $(this.div());

		if (div.hasClass('av-visible'))
			div.removeClass('av-visible');

		if (!div.hasClass('av-shunya'))
			div.addClass('av-shunya');
	}

	function _change_state (state) {
		var div = $(this.div());

		if (states.indexOf(state) == -1) {
			log.error ('change_state: unrecognized container state (' + state + ') requested');
			return false;
		}

		/* This should mark the container with one of the following classes:
		 *     + av-connected
		 *     + av-streaming
		 *     + av-error
		 */
		for (var i = 0; i < states.length; i++) {

			if (state != states[i]) {
				div.removeClass('av-' + states[i]);
				continue;
			}

			div.addClass('av-' + state);
		}

		this.state = state;
		return true;
	}

	function change_state (state) {
		var old_state = this.state;
		if (_change_state.call (this, state)) {
			if (state === 'connected' || state === 'streaming')
				reveal.call (this);
			else
				conceal.call (this);

			log.info ('[ #' + this.id() + ' ]changed state from "' + old_state + '" to "' + state + '"');
		}
	}

	function is_primary () {
		var div = this.div();

		if ($(div).hasClass('av-primary'))
			return true;

		return false;
	}

	return function (div) {
		this.id_     = $(div).attr('id');
		this.div_    = div;
		this.type    = null;
		this.state   = 'initial';
		this.conn_id = null;
		this.stream  = null;

		this.div               = function () { return this.div_; };
		this.id                = function () { return this.id_; };
		this.set_type          = set_type;
		this.set_connection_id = set_connection_id;
		this.stream_created    = stream_created;
		this.stream_destroyed  = stream_destroyed;
		this.giveup            = giveup;
		this.show_error        = show_error;
		this.change_state      = change_state;
		this.is_primary        = is_primary;
	};
});
