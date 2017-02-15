import _ from 'underscore'
import React from 'react'
import moment from 'moment-timezone'
import parseDuration from 'parse-duration'
import { DateRangePicker } from 'react-dates'
import BaseWidget from './Base'

// Modified copy of 'react-dates/lib/css/_datepicker.css'
import '../../../css/datepicker.css'

class ControlsWidget extends BaseWidget {
	constructor () {
		super()
		this.state = {
			focusedInput: null,
			startDate: null,
			endDate: null,
		}
	}

	componentWillMount () {
		var shared = this.props.shared

		if ( ! shared.dateRange || ! shared.interval) {
			this.setDefaults()
		}
	}
	setDefaults () {
		var end = this.props.dateRange.end
		if (end === 'now') end = moment.utc().startOf('day')
		else end = moment.utc(end)

		var start = this.props.dateRange.start
		if (start.startsWith('-')) start = end.clone().subtract(parseDuration(start.substr(1)), 'milliseconds')
		else start = moment.utc(start)

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

	onFocusChange (focusedInput) {
		this.setState({ focusedInput })

		// On close
		if (focusedInput === null) {
			// Wait for DateRangePicker.onDatesChange
			setTimeout(() => {
				var { startDate, endDate } = this.state
				var dateRange = this.props.shared.dateRange

				// No change
				if ( ! startDate || ! endDate ) return

				var start = startDate.clone().startOf('day')
				var end = endDate.clone().endOf('day')

				// No change
				if (start.isSame(dateRange.start) && end.isSame(dateRange.end)) return

				this.setURLFilter(start, end, this.props.shared.interval)
				this.setDateRange(start, end)
			}, 100)
		}
	}
	onDateRangeChange ({ startDate, endDate }) {
		this.setState({ startDate, endDate })
	}
	onIntervalChange (ev) {
		var interval = ev.target.value
		var shared = this.props.shared

		this.setURLFilter(shared.dateRange.start, shared.dateRange.end, interval)
		this.setInterval(interval)
	}

	render () {
		var shared = this.props.shared
		var { focusedInput, startDate, endDate } = this.state
		var today = moment.utc().endOf('day')

		if ( ! startDate) startDate = shared.dateRange.start
		if ( ! endDate) endDate = shared.dateRange.end

		// Show previous month instead of next one (because we're working with historic data)
		var initialMonth = startDate.clone().startOf('month')
		if (initialMonth.isSame(endDate.clone().startOf('month'))) {
			initialMonth.subtract(1, 'month')
		}

		return (
			<div class="well well-sm">
				<div class="col-sm-4">
					<div class="form-group">
						<label style={{ display: 'block' }}>Date range</label>
						<div class="form-control">
							<DateRangePicker
								focusedInput={focusedInput}
								startDate={startDate}
								endDate={endDate}
								displayFormat="DD-MM-YYYY"
								minimumNights={0}
								initialVisibleMonth={() => initialMonth}
								isOutsideRange={() => false}
								isDayBlocked={(date) => date.isAfter(today)}
								onFocusChange={this.onFocusChange.bind(this)}
								onDatesChange={this.onDateRangeChange.bind(this)} />
						</div>
					</div>
				</div>
				<div class="col-sm-4">
					<div class="form-group">
						<label>Interval</label>
						<select class="form-control" value={shared.interval} onChange={this.onIntervalChange.bind(this)}>
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
