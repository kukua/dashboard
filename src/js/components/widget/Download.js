import _ from 'underscore'
import decapitalize from 'underscore.string/decapitalize'
import React from 'react'
import moment from 'moment-timezone'
import parseDuration from 'parse-duration'
import BaseWidget from './Base'
import MeasurementFilterModel from '../../models/MeasurementFilter'
import notify from '../../helpers/notify'
import DateRangePicker from '../input/dateRangePicker'
import actions from '../../actions/measurement'
import downloadTSV from '../../helpers/downloadTSV'
import getDeviceLabel from '../../helpers/getDeviceLabel'

const availableFields = {
	temp: 'Temperature (°C)',
	humid: 'Relative humidity (%)',
	rain: 'Rainfall (mm sum)',
	windDir: 'Wind direction (°)',
	windSpeed: 'Wind speed (km/h)',
	gustDir: 'Gust direction (°)',
	gustSpeed: 'Gust speed (km/h)',
	pressure: 'Pressure (hPa)',
}
const availableAggregators = {
	avg: 'Average',
	min: 'Minimum',
	max: 'Maximum',
	sum: 'Sum of',
	count: 'Count of',
	std: 'Standard deviation of',
	varience: 'Varience of',
}

class DownloadWidget extends BaseWidget {
	constructor () {
		super()
		this.state = {
			isLoading: false,
			fields: [
				{ name: 'timestamp' },
			],
			focusedInput: null,
			startDate: null,
			endDate: null,
			interval: '',
			sorting: [
				{ name: 'timestamp', order: -1 },
			],
			limit: 0,
		}
	}

	componentWillMount () {
		this.setDefaults(this.props)
	}
	componentWillReceiveProps (next) {
		var props = {}

		if (next.fields != this.props.fields) props.fields = next.fields
		if (next.dateRange != this.props.dateRange) props.dateRange = next.dateRange
		if (next.interval != this.props.interval) props.interval = next.interval
		if (next.sorting != this.props.sorting) props.sorting = next.sorting
		if (next.limit != this.props.limit) props.limit = next.limit

		this.setDefaults(props)
	}
	setDefaults (props) {
		var { fields, dateRange, interval, sorting, limit } = props
		var state = this.state
		var startDate, endDate

		if (typeof fields === 'string') {
			fields = _.compact(_.map(fields.split(','), (field) => {
				if ( ! field) return
				var [ name, aggregator ] = field.split(':')
				return { name, aggregator }
			}))
		}

		if (dateRange) {
			endDate = dateRange.end
			if (endDate === 'now') {
				endDate = moment.utc().startOf('day')
			} else {
				endDate = moment.utc(endDate)
			}

			startDate = dateRange.start
			if (startDate.startsWith('-')) {
				startDate = endDate.clone().subtract(parseDuration(startDate.substr(1)), 'milliseconds')
			} else {
				startDate = moment.utc(startDate)
			}
		}

		if (interval) {
			interval = (interval.default || interval.options[0][0])
		} else {
			interval = undefined
		}

		if (typeof sorting === 'string') {
			sorting = _.compact(_.map(sorting.split(','), (name) => {
				if ( ! name) return
				var order = (name.startsWith('-') ? -1 : 1)
				if (name.startsWith('-')) name = name.substr(1)
				return { name, order }
			}))
		}

		this.setState({
			fields: (fields !== undefined ? fields : state.fields),
			startDate: (startDate || state.startDate),
			endDate: (endDate || state.endDate),
			interval: (interval !== undefined ? interval : state.interval),
			sorting: (sorting !== undefined ? sorting : state.sorting),
			limit: (limit !== undefined ? limit : state.limit),
		})
	}

	onRemoveFieldClick (ev, field) {
		ev.preventDefault()

		var fields = this.state.fields
		var index = fields.indexOf(field)

		if (index === -1) return

		fields.splice(index, 1)

		this.setState({ fields })
	}
	onAddFieldClick (ev) {
		ev.preventDefault()

		var fields = this.state.fields

		fields.push({
			name: _.keys(availableFields)[0],
			aggregator: _.keys(availableAggregators)[0],
		})

		this.setState({ fields })
	}
	onFieldChange (ev, field) {
		var fields = this.state.fields
		field[ev.target.name] = ev.target.value
		this.setState({ fields })
	}

	onChange (ev) {
		this.setState({ [ev.target.name]: ev.target.value })
	}
	onDateRangeChange ({ startDate, endDate }) {
		this.setState({ startDate, endDate })
	}

	getSortName (field) {
		if (field.name === 'timestamp') return field.name
		return (field.name + ':' + field.aggregator)
	}
	getSortLabel (field) {
		if (field.name === 'timestamp') return 'Timestamp'
		return (availableAggregators[field.aggregator] + ' ' + decapitalize(availableFields[field.name]))
	}
	onRemoveSortClick (ev, field) {
		ev.preventDefault()

		var sorting = this.state.sorting
		var index = sorting.indexOf(field)

		if (index === -1) return

		sorting.splice(index, 1)

		this.setState({ sorting })
	}
	onAddSortClick (ev) {
		ev.preventDefault()

		var sorting = this.state.sorting

		sorting.push({
			name: this.getSortName(_.last(this.state.fields)),
			order: 1,
		})

		this.setState({ sorting })
	}
	onSortChange (ev, field) {
		var sorting = this.state.sorting
		var value = ev.target.value

		if (ev.target.name === 'order') {
			value = parseInt(value)
		}

		field[ev.target.name] = value

		this.setState({ sorting })
	}

	onDownloadClick (ev) {
		ev.preventDefault()

		var filter = new MeasurementFilterModel()
		filter.setGrouped(false)

		var deviceGroups = []
		var devices = []

		this.props.shared.deviceGroups.forEach((group) => {
			var includedDevices = _.filter(group.getDevices(), (device) => device.getAttribute('include'))
			var allIncluded = (includedDevices.length === group.getDevices().length)

			if (allIncluded) {
				deviceGroups.push(group.id)
				return
			}

			includedDevices.forEach((device) => devices.push(device.id))
		})

		if (deviceGroups.length === 0 && devices.length === 0) {
			notify.error('Please select at least one device (group).')
			return
		}

		var limit = (parseInt(this.state.limit) || 0)

		try {
			filter
				.setGrouped(false)
				.setDevices(devices)
				.setDeviceGroups(deviceGroups)
				.setFields(this.state.fields)
				.setFrom(this.state.startDate)
				.setTo(this.state.endDate)
				.setInterval(this.state.interval)
				.setSorting(this.state.sorting)
				.setLimit(limit)
		} catch (err) {
			notify.error(err.message)
			return
		}

		this.setState({ isLoading: true })

		actions.fetchByFilter(filter)
			.then((list) => {
				var devices = _.flatten(_.map(this.props.shared.deviceGroups, (group) => group.getDevices()))
				var columns = list.getColumns()
				var lines = _.chain(list.getValues())
					.map((rows, id) => _.map(rows, (row) => {
						row = _.map(row, (value, i) => {
							if (columns[i] === 'timestamp') return moment.utc(value * 1000).toISOString()
							return Math.round(value * 100) / 100
						})
						row.unshift(getDeviceLabel(id, devices))
						return row
					}))
					.flatten(true)
					.value()
				columns.unshift('station')
				downloadTSV(columns, lines, 'data.' + moment().format('DD-MM-YYYY') + '.tsv')
				this.setState({ isLoading: false })
			})
			.catch((err) => {
				this.setState({ isLoading: false })
				notify.error(err.message)
			})
	}

	render () {
		var isLoading = ( ! this.props.shared.deviceGroups || this.state.isLoading)

		return (
			<form class="form">
				<div class="form-group">
					<label>Fields</label>
					{this.state.fields.map((field, i) => {
						var isTimestamp = (field.name === 'timestamp')
						var disabled = (isLoading || isTimestamp)

						return (
							<div key={i} class="form-group form-inline">
								<select
									class="form-control"
									name="aggregator"
									value={field.aggregator}
									onChange={(ev) => this.onFieldChange(ev, field)}
									disabled={disabled}>
									{isTimestamp && <option />}
									{_.map(availableAggregators, (label, aggregator) => (
										<option key={aggregator} value={aggregator}>{label}</option>
									))}
								</select>
								<select
									class="form-control"
									name="name"
									value={field.name}
									onChange={(ev) => this.onFieldChange(ev, field)}
									disabled={disabled}>
									{isTimestamp && <option>Timestamp</option>}
									{_.map(availableFields, (label, name) => (
										<option key={name} value={name}>{label}</option>
									))}
								</select>
								<button
									class="btn btn-danger"
									onClick={(ev) => this.onRemoveFieldClick(ev, field)}
									disabled={disabled}>
									<i class="fa fa-remove" title="Remove field" />
								</button>
							</div>
						)
					})}
					<button class="btn btn-primary" onClick={this.onAddFieldClick.bind(this)} disabled={isLoading}>
						<i class="fa fa-plus text-left" />
						Add field
					</button>
				</div>
				<div class="form-group">
					<label style={{ display: 'block' }}>Date range</label>
					<div class="form-control">
						<DateRangePicker
							startDate={this.state.startDate}
							endDate={this.state.endDate}
							onChange={this.onDateRangeChange.bind(this)}
							disabled={isLoading} />
					</div>
				</div>
				<div class="form-group">
					<label>Interval</label>
					<select
						class="form-control"
						name="interval"
						value={this.state.interval}
						onChange={this.onChange.bind(this)}
						disabled={isLoading}>
						{this.props.interval.options.map(([ value, label ]) => (
							<option key={value} value={value}>{label}</option>
						))}
					</select>
				</div>
				<div class="form-group">
					<label>Sorting</label>
					<div class="clearfix" />
					{this.state.sorting.map((field, i) => {
						var disabled = (isLoading)

						return (
							<div key={i} class="form-group form-inline">
								<select
									class="form-control"
									name="name"
									value={field.name}
									onChange={(ev) => this.onSortChange(ev, field)}
									disabled={disabled}>
									{_.map(this.state.fields, (field) => {
										var name = this.getSortName(field)

										return (
											<option key={name} value={name}>{this.getSortLabel(field)}</option>
										)
									})}
								</select>
								<select
									class="form-control"
									name="order"
									value={field.order}
									onChange={(ev) => this.onSortChange(ev, field)}
									disabled={disabled}>
									<option value={1}>Ascending</option>
									<option value={-1}>Descending</option>
								</select>
								<button
									class="btn btn-danger"
									onClick={(ev) => this.onRemoveSortClick(ev, field)}
									disabled={disabled}>
									<i class="fa fa-remove" title="Remove field" />
								</button>
							</div>
						)
					})}
					<button class="btn btn-primary" onClick={this.onAddSortClick.bind(this)} disabled={isLoading}>
						<i class="fa fa-plus text-left" />
						Add field
					</button>
					<p class="help-block">The spreadsheet will always be sorted on station and timestamp (ascending).</p>
				</div>
				<div class="form-group">
					<label>Limit</label>
					<input
						type="number"
						min={0}
						class="form-control"
						name="limit"
						value={this.state.limit}
						onChange={this.onChange.bind(this)}
						disabled={isLoading} />
					<p class="help-block">Use 0 for no limit.</p>
				</div>
				<div class="form-group">
					<button
						class="btn btn-primary pull-right"
						onClick={this.onDownloadClick.bind(this)}
						disabled={isLoading}>
						Download spreadsheet
					</button>
				</div>
				<div class="clearfix" />
			</form>
		)
	}
}

DownloadWidget.propTypes = Object.assign({}, BaseWidget.propTypes, {
	fromURL: React.PropTypes.bool,
	fromDevicePicker: React.PropTypes.bool,
	fields: React.PropTypes.string,
	dateRange: React.PropTypes.shape({
		start: React.PropTypes.string.isRequired,
		end: React.PropTypes.string.isRequired,
	}),
	interval: React.PropTypes.shape({
		default: React.PropTypes.string.isRequired,
		options: React.PropTypes.array.isRequired,
	}),
	sorting: React.PropTypes.string,
	limit: React.PropTypes.number,
	shared: React.PropTypes.shape({
		deviceGroups: React.PropTypes.array,
	}).isRequired,
})

export default DownloadWidget
