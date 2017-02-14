import _ from 'underscore'
import Promise from 'bluebird'
import React from 'react'
import moment from 'moment-timezone'
import Graph from './Graph'
import actions from '../../actions/measurement'
import MeasurementFilterModel from '../../models/MeasurementFilter'
import MeasurementListModel from '../../models/MeasurementList'
import { instance as user } from '../../lib/user'

class FilterGraphWidget extends Graph {
	constructor () {
		super()
		this.state = {
			isLoading: true,
			filters: [],
		}
	}

	componentWillMount () {
		this.loadData(this.createFilters(this.props))
	}
	createFilters (props) {
		if ( ! props.shared.deviceGroups) return []

		var deviceLabels = user.getConfig('deviceLabels') || {}
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

		return _.chain(props.shared.deviceGroups)
			.map((group) => group.getDevices())
			.flatten()
			.filter((device) => device.getAttribute('include'))
			.uniq(false, (device) => device.id)
			.map((device) => (
				new MeasurementFilterModel()
					.setName(deviceLabels[device.id] || device.name)
					.addDevice(device.id)
					.addField('timestamp')
					.addField(fieldName, fieldAggregator)
					.setFrom(from)
					.setTo(to)
					.setInterval(interval)
					.addSort('timestamp', -1)
			))
			.value()
	}
	componentWillReceiveProps (next) {
		this.loadData(this.createFilters(next))
	}
	loadData (filters) {
		// TODO(mauvm): Improve way of comparing filters
		if (JSON.stringify(this.state.filters) === JSON.stringify(filters)) {
			return
		}

		this.setState({ filters, isLoading: true })

		Promise.all(filters.map((filter) => (
			actions.fetchByFilter(filter)
				.then(
					(list) => list,
					(err) => {
						console.error(err)
						return null
					}
				)
		))).then((lists) => {
			this.setState({ lists: _.compact(lists), isLoading: false })
		})
	}

	getYAxisLabel () {
		return this.props.filter.field.label
	}
	getSeries () {
		var lists = this.state.lists

		if ( ! Array.isArray(lists) || lists.length === 0) return []

		return lists.map((list) => {
			var columns = list.getColumns()

			return {
				name: this.getListName(list),
				data: list.getValues().map((row) => row.map((value, j) => {
					if (columns[j] === 'timestamp') return value * 1000
					return Math.round(value * 100) / 100
				})),
			}
		})
	}
	getListName (list) {
		if ( ! (list instanceof MeasurementListModel)) {
			throw new Error('Invalid measurement list model.')
		}

		return list.getRequestFilter().getName()
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
