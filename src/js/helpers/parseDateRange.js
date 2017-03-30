import moment from 'moment-timezone'
import parseDuration from 'parse-duration'

export default (dateRange) => {
	if (typeof dateRange !== 'object') {
		throw new Error('Invalid date range: not an object')
	}
	if ( ! dateRange.start) {
		throw new Error('Invalid date range: missing start string')
	}
	if ( ! dateRange.end) {
		throw new Error('Invalid date range: missing end string')
	}

	// TODO(mauvm): Determine if start and end are last second in day or first second of next day.

	var end = dateRange.end
	var start = dateRange.start

	if (end === 'now') {
		end = moment.utc().endOf('day')
	} else {
		end = moment.utc(end)
	}

	if (start.startsWith('-')) {
		start = end.clone().subtract(parseDuration(start.substr(1)), 'milliseconds')
		if (start.isSame(start.clone().endOf('day'))) {
			start.add(1, 'millisecond')
		}
	} else {
		start = moment.utc(start)
	}

	return [start, end]
}
