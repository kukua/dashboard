import _ from 'underscore'
import React from 'react'
import moment from 'moment-timezone'
import parseDuration from 'parse-duration'
import BaseWidget from './Base'
import DateRangePicker from '../input/dateRangePicker'

class ControlsWidget extends BaseWidget {
	componentWillMount () {
		var shared = this.props.shared

		if ( ! shared.dateRange || ! shared.interval) {
			this.setDefaults()
		}
	}
	setDefaults () {
		var end = this.props.dateRange.end
		if (end === 'now') {
			end = moment.utc().startOf('day')
		}else {
			end = moment.utc(end)
		}

		var start = this.props.dateRange.start
		if (start.startsWith('-')) {
			start = end.clone().subtract(parseDuration(start.substr(1)), 'milliseconds')
		} else {
			start = moment.utc(start)
		}

		var interval = (this.props.interval.default || this.props.interval.options[0][0])

		if (this.props.fromURL) {
			var filter = this.getURLFilter()

			if (filter.startDate) start = filter.startDate
			if (filter.endDate) end = filter.endDate
			if (filter.interval) interval = filter.interval
		}

		this.setURLFilter(start, end, interval)
		this.setDateRange(start, end)
		this.setInterval(interval)
	}
	setDateRange (start, end) {
		if ( ! (start instanceof moment) || ! start.isValid()) {
			console.error('Invalid start date:', start)
			return
		}
		if ( ! (end instanceof moment) || ! end.isValid()) {
			console.error('Invalid end date:', end)
			return
		}
		this.props.onSetShared('dateRange', { start, end })
	}
	setInterval (interval) {
		this.props.onSetShared('interval', interval)
	}
	getURLFilter () {
		var { startDate, endDate, interval } = this.context.location.query

		if (startDate) {
			startDate = moment.utc(startDate, 'DD-MM-YYYY').startOf('day')
			startDate = (startDate.isValid() ? startDate.startOf('day') : undefined)
		}
		if (endDate) {
			endDate = moment.utc(endDate, 'DD-MM-YYYY').endOf('day')
			endDate = (endDate.isValid() ? endDate.endOf('day') : undefined)
		}
		if ((interval || '').match(/^[0-9]+$/)) {
			interval = parseInt(interval)
		}
		// Valid interval
		if (interval && ! _.find(this.props.interval.options, (option) => option[0] == interval)) {
			interval = undefined
		}

		return { startDate, endDate, interval }
	}
	setURLFilter (startDate, endDate, interval) {
		if ( ! this.props.fromURL) return // Disabled

		var location = this.context.location
		var query = Object.assign({}, location.query)
		query.startDate = startDate.format('DD-MM-YYYY')
		query.endDate = endDate.format('DD-MM-YYYY')
		query.interval = interval

		var route = Object.assign({}, location, {
			pathname: (location.pathname.startsWith('/') ? '' : '/') + location.pathname,
			query,
		})
		this.context.router.push(route)
	}

	onDateRangeChange ({ startDate, endDate }) {
		this.setURLFilter(startDate, endDate, this.props.shared.interval)
		this.setDateRange(startDate, endDate)
	}
	onIntervalChange (ev) {
		var interval = ev.target.value
		var shared = this.props.shared

		this.setURLFilter(shared.dateRange.start, shared.dateRange.end, interval)
		this.setInterval(interval)
	}

	render () {
		var { interval, dateRange = {} } = this.props.shared

		return (
			<div class="well well-sm">
				<div class="col-sm-4">
					<div class="form-group">
						<label style={{ display: 'block' }}>Date range</label>
						<div class="form-control">
							<DateRangePicker
								startDate={dateRange.start}
								endDate={dateRange.end}
								onChange={this.onDateRangeChange.bind(this)} />
						</div>
					</div>
				</div>
				<div class="col-sm-4">
					<div class="form-group">
						<label>Interval</label>
						<select class="form-control" value={interval} onChange={this.onIntervalChange.bind(this)}>
						{this.props.interval.options.map(([ value, label ]) => (
							<option key={value} value={value}>{label}</option>
						))}
						</select>
					</div>
				</div>
				<div class="clearfix" />
			</div>
		)
	}
}

ControlsWidget.propTypes = Object.assign({}, BaseWidget.propTypes, {
	fromURL: React.PropTypes.bool,
	dateRange: React.PropTypes.shape({
		start: React.PropTypes.string.isRequired,
		end: React.PropTypes.string.isRequired,
	}),
	interval: React.PropTypes.shape({
		default: React.PropTypes.string,
		options: React.PropTypes.array.isRequired,
	}),
})
ControlsWidget.contextTypes = {
	location: React.PropTypes.object,
	router: React.PropTypes.object,
}

export default ControlsWidget
