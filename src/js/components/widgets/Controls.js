import React from 'react'
import moment from 'moment-timezone'
import parseDuration from 'parse-duration'
import InputMoment from 'input-moment'
import BaseWidget from './Base'
import date from '../../lib/date'

require('input-moment/dist/input-moment.css')

class ControlsWidget extends BaseWidget {
	constructor () {
		super()
		this.state = {
			from: null,
			showFromPicker: false,
			to: null,
			showToPicker: false,
		}
	}

	componentWillMount () {
		var shared = this.props.shared

		if ( ! shared.from || ! shared.to || ! shared.interval) {
			this.setDefaults()
		}
	}
	setDefaults () {
		var to = this.props.date_range.to
		if (to === 'now') to = moment()
		else to = moment.utc(to)

		var from = this.props.date_range.from
		if (from.startsWith('-')) from = to.clone().subtract(parseDuration(from.substr(1)), 'milliseconds')
		else from = moment.utc(from)

		var interval = this.props.interval.options[0][0]

		this.setFrom(from)
		this.setTo(to)
		this.setInterval(interval)
	}
	setFrom (date) {
		if ( ! (date instanceof moment) || ! date.isValid()) {
			console.error('Invalid from date:', date)
			return
		}
		this.props.onSetShared('from', date)
	}
	setTo (date) {
		if ( ! (date instanceof moment) || ! date.isValid()) {
			console.error('Invalid to date:', date)
			return
		}
		this.props.onSetShared('to', date)
	}
	setInterval (interval) {
		this.props.onSetShared('interval', interval)
	}

	showFromPicker () {
		this.setState({ from: this.props.shared.from, showFromPicker: true })
	}
	hideFromPicker () {
		this.setFrom(this.state.from)
		this.setState({ from: null, showFromPicker: false })
	}
	showToPicker () {
		this.setState({ to: this.props.shared.to, showToPicker: true })
	}
	hideToPicker () {
		this.setTo(this.state.to)
		this.setState({ to: null, showToPicker: false })
	}
	onIntervalChange (ev) {
		this.setInterval(ev.target.value)
	}

	render () {
		var shared = this.props.shared

		return (
			<div class="well well-sm">
				<div class="col-sm-4">
					<div class="form-group">
						<label>From</label>
						{this.state.showFromPicker
							? <InputMoment
								moment={this.state.from}
								onChange={(from) => this.setState({ from })}
								onSave={this.hideFromPicker.bind(this)}
								prevMonthIcon="fa fa-chevron-left"
								nextMonthIcon="fa fa-chevron-right"
							/>
							: <input class="form-control" type="text" value={date.format(shared.from)} readOnly={true}
								onClick={() => this.showFromPicker()} />
						}
					</div>
				</div>
				<div class="col-sm-4">
					<div class="form-group">
						<label>To</label>
						{this.state.showToPicker
							? <InputMoment
								moment={this.state.to}
								onChange={(to) => this.setState({ to })}
								onSave={this.hideToPicker.bind(this)}
								prevMonthIcon="fa fa-chevron-left"
								nextMonthIcon="fa fa-chevron-right"
							/>
							: <input class="form-control" type="text" value={date.format(shared.to)} readOnly={true}
								onClick={() => this.showToPicker()} />
						}
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
	date_range: React.PropTypes.shape({
		from: React.PropTypes.string.isRequired,
		to: React.PropTypes.string.isRequired,
	}),
	interval: React.PropTypes.shape({
		options: React.PropTypes.array.isRequired,
	}),
})

export default ControlsWidget
