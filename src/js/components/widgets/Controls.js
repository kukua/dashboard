import React from 'react'
import moment from 'moment-timezone'
import parseDuration from 'parse-duration'
import { DateRangePicker } from 'react-dates'
import BaseWidget from './Base'

//import 'react-dates/lib/css/_datepicker.css'
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

	onFocusChange (focusedInput) {
		this.setState({ focusedInput })

		// On close
		if (focusedInput === null) {
			var { startDate, endDate } = this.state
			var dateRange = this.props.shared.dateRange

			// No change
			if ( ! startDate || ! endDate ) return

			var start = startDate.clone().startOf('day')
			var end = endDate.clone().startOf('day')

			// No change
			if (start.isSame(dateRange.start) && end.isSame(dateRange.end)) return

			this.setDateRange(start, end)
		}
	}
	onDateRangeChange ({ startDate, endDate }) {
		this.setState({ startDate, endDate })
	}
	onIntervalChange (ev) {
		this.setInterval(ev.target.value)
	}

	render () {
		var shared = this.props.shared
		var { focusedInput, startDate, endDate } = this.state
		var today = moment.utc().endOf('day')

		if ( ! startDate) startDate = shared.dateRange.start
		if ( ! endDate) endDate = shared.dateRange.end

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
	dateRange: React.PropTypes.shape({
		start: React.PropTypes.string.isRequired,
		end: React.PropTypes.string.isRequired,
	}),
	interval: React.PropTypes.shape({
		default: React.PropTypes.string,
		options: React.PropTypes.array.isRequired,
	}),
})

export default ControlsWidget
