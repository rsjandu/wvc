var ERR         = require('common/error');
var helpers     = require('common/helpers');
var moment      = require('moment');
var mylog       = require('api-backend/common/log').child({ module : 'models/sched'});

var sched = {};
var job_id = 0;
var jobs = {};

/*
 * NOTE: the 'when' is assumed to be in Universal time */
sched.schedule = function (req, when, duration, job) {

	if (!validate_input (req, when, duration))
		return null;

	if (!can_schedule (req, when))
		return null;

	return schedule (req, when, duration, job);
};

var margin_secs = 5;

function validate_input (req, when, duration) {
	if (!helpers.is_numeric(duration)) {
			req.log.warn ({ schedule : {
					duration : duration,
					}
			}, 'duration not numeric. rejected');

			return false;
	}

	return true;
}

function can_schedule (req, when) {
	var now = moment ();
	var after = now.add(margin_secs, 's');
	var sched_time = moment(when);

	if (!sched_time.isValid()) {

			req.log.warn ({ schedule : {
					when : when,
					}
			}, 'invalid date/time. rejected');

			return false;
	}

	if (sched_time.isBefore(after)) {

			req.log.warn ({ schedule : {
					when          : when,
					time_to_start : moment().diff(moment(when))/1000 + ' secs',
					margin_secs   : margin_secs 
					}
			}, 'schedule rejected - should be atleast ' + margin_secs + ' secs into the future');

			return false;
	}

	return true;
}

function schedule (req, when, duration, job) {
	var time_to_start = moment(when).diff(moment());
	duration = parseFloat(duration) * 1000;

	job_id++;

	jobs[job_id] = {
		job_id   : job_id,
		when     : when,
		duration : duration,
		req_id   : req.req_id,
		job      : job
	};

	jobs[job_id].start_timer = setTimeout (fire_schedule.bind(jobs[job_id], 'start'), time_to_start);

	if (duration > 0)
		jobs[job_id].end_timer = setTimeout (fire_schedule.bind(jobs[job_id], 'end'), time_to_start + duration);

	req.log.info ({ schedule : {
				job_id      : job_id, 
				when        : moment(when).toISOString(),
				starts_in   : time_to_start/1000 + ' secs',
				ends_in     : duration > 0 ? (time_to_start + duration)/1000 + ' secs' : 'instantly',
				duration    : duration/1000 + ' secs',
			}}, 
		'new schedule');

	return job_id;
}

function fire_schedule (start_end) {
	mylog.info ({ schedule : {
			job_id : this.job_id,
			arg    : start_end
		}
	}, 'job fired');

	this.job (this.job_id, start_end);
}

module.exports = sched;
