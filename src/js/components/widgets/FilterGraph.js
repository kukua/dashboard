import _ from 'underscore'
import React from 'react'
import moment from 'moment-timezone'
import Graph from './Graph'
import actions from '../../actions/measurement'
import MeasurementFilterModel from '../../models/MeasurementFilter'
import { current as user } from '../../models/User'

class FilterGraphWidget extends Graph {
	constructor () {
		super()
		this.state = {
			isLoading: true,
			filter: null,
			list: null,
		}
	}

	componentWillMount () {
		this.loadData(this.createFilter(this.props))
	}
	createFilter (props) {
		if ( ! props.shared.deviceGroups) return null

		var fieldName = this.props.filter.field.name
		var fieldAggregator = this.props.filter.field.aggregator

		var to = moment()
		var from = to.clone().subtract(7, 'days')
		var interval = '1h'
		var shared = this.props.shared

		if (shared.dateRange) {
			from = shared.dateRange.start
			to = shared.dateRange.end
		}
		if (shared.interval) interval = shared.interval

		var deviceIDs =_.pluck(this.getIncludedDevices(props.shared.deviceGroups), 'id')

		if (deviceIDs.length === 0) return null

		return new MeasurementFilterModel()
			.setGrouped(false)
			.setDevices(deviceIDs)
			.addField('timestamp')
			.addField(fieldName, fieldAggregator)
			.setFrom(from)
			.setTo(to)
			.setInterval(interval)
			.addSort('timestamp', -1)
	}
	getIncludedDevices (deviceGroups) {
		return _.chain(deviceGroups || this.props.shared.deviceGroups)
			.map((group) => group.getDevices())
			.flatten()
			.filter((device) => device.getAttribute('include'))
			.uniq(false, (device) => device.id)
			.value()
	}
	componentWillReceiveProps (next) {
		this.loadData(this.createFilter(next))
	}
	loadData (filter) {
		// TODO(mauvm): Improve way of comparing filter
		if (this.state.filter && JSON.stringify(this.state.filter) === JSON.stringify(filter)) {
			return
		}

		var isLoading = !! (filter || ! this.props.shared.deviceGroups)

		this.setState({ isLoading, filter, list: null })

		if (filter) {
			actions.fetchByFilter(filter)
				.then((list) => this.setState({ list, isLoading: false }))
		}
	}

	getYAxisLabel () {
		return this.props.filter.field.label
	}
	getSeries () {
		var list = this.state.list

		if ( ! list) return []

		var columns = list.getColumns()
		var deviceLabels = user.getConfig('deviceLabels') || {}
		var devices = this.getIncludedDevices()

		return _.map(list.getValues(), (values, id) => ({
			name: (deviceLabels[id] || (_.find(devices, (device) => device.id === id) || { name: id }).name),
			data: values.map((row) => row.map((value, j) => {
				if (columns[j] === 'timestamp') return value * 1000
				return Math.round(value * 100) / 100
			})),
		}))
	}

	renderWarning () {
		if (this.getIncludedDevices().length === 0) {
			return (<span>No stations selected.</span>)
		}
	}
}

// Override GraphWidget.propTypes
FilterGraphWidget.propTypes = {
	filter: React.PropTypes.shape({
		field: React.PropTypes.shape({
			name: React.PropTypes.string.isRequired,
			aggregator: React.PropTypes.string.isRequired,
			label: React.PropTypes.string.isRequired,
		}).isRequired,
	}).isRequired,
	shared: React.PropTypes.shape({
		deviceGroups: React.PropTypes.array,
		from: React.PropTypes.instanceOf(moment),
		to: React.PropTypes.instanceOf(moment),
		interval: React.PropTypes.oneOfType([
			React.PropTypes.number,
			React.PropTypes.string,
		]),
	}).isRequired,
}

export default FilterGraphWidget
