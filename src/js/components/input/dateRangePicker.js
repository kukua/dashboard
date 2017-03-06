import React from 'react'
import moment from 'moment-timezone'
import { DateRangePicker } from 'react-dates'

// Modified copy of 'react-dates/lib/css/_datepicker.css'
import '../../../css/datepicker.css'

class DateRangePickerInput extends React.Component {
	constructor () {
		super()
		this.state = {
			focusedInput: null,
			startDate: null,
			endDate: null,
		}
	}

	componentWillMount () {
		var { startDate, endDate } = this.props
		this.setDateRange(startDate, endDate)
	}
	componentWillReceiveProps (next) {
		var { startDate, endDate } = next
		this.setDateRange(startDate, endDate)
	}
	parseDateProp (date) {
		date = moment.utc(date)
		if ( ! date.isValid()) date = moment.utc()
		return date
	}
	setDateRange (startDate, endDate) {
		startDate = this.parseDateProp(startDate)
		endDate = this.parseDateProp(endDate)
		this.setState({ startDate, endDate })
	}

	onFocusChange (focusedInput) {
		this.setState({ focusedInput })

		// On close
		if (focusedInput === null) {
			// Wait for DateRangePicker.onDatesChange
			setTimeout(() => {
				var { startDate, endDate } = this.state

				// No change
				if ( ! startDate || ! endDate ) return
				if (startDate.isSame(this.parseDateProp(this.props.startDate)) &&
					endDate.isSame(this.parseDateProp(this.props.endDate))) {
					return
				}

				this.props.onChange({ startDate, endDate })
			}, 100)
		}
	}
	onDateRangeChange ({ startDate, endDate }) {
		if (startDate) this.setState({ startDate: startDate.clone().startOf('day') })
		if (endDate) this.setState({ endDate: endDate.clone().endOf('day') })
	}

	render () {
		var today = moment.utc().endOf('day')
		var { startDate, endDate } = this.state

		startDate = moment.utc(startDate)
		endDate = moment.utc(endDate)

		// Show previous month instead of next one (because we're working with historic data)
		var initialMonth = startDate.clone().startOf('month')

		if (initialMonth.isSame(endDate.clone().startOf('month'))) {
			initialMonth.subtract(1, 'month')
		}

		return (
			<DateRangePicker
				focusedInput={this.state.focusedInput}
				startDate={startDate}
				endDate={endDate}
				displayFormat="DD-MM-YYYY"
				minimumNights={0}
				initialVisibleMonth={() => initialMonth}
				isOutsideRange={() => false}
				isDayBlocked={(date) => date.isAfter(today)}
				onFocusChange={this.onFocusChange.bind(this)}
				onDatesChange={this.onDateRangeChange.bind(this)}
				disabled={this.props.disabled} />
		)
	}
}

DateRangePickerInput.propTypes = {
	startDate: React.PropTypes.oneOfType([
		React.PropTypes.instanceOf(moment),
		React.PropTypes.string,
		React.PropTypes.number,
	]),
	endDate: React.PropTypes.oneOfType([
		React.PropTypes.instanceOf(moment),
		React.PropTypes.string,
		React.PropTypes.number,
	]),
	onChange: React.PropTypes.func.isRequired,
	disabled: React.PropTypes.bool,
}

export default DateRangePickerInput
