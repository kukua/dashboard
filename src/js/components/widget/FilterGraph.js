import _ from 'underscore'
import React from 'react'
import moment from 'moment-timezone'
import Graph from './Graph'
import actions from '../../actions/measurement'
import MeasurementFilterModel from '../../models/MeasurementFilter'
import { current as user } from '../../models/User'
import downloadTSV from '../../helpers/downloadTSV'

class FilterGraphWidget extends Graph {
	constructor () {
		super()
		this.state = {
			isLoading: true,
			filter: null,
			activeField: '',
			list: null,
		}
	}

	componentWillMount () {
		this.loadData(this.createFilter())
	}
	componentDidUpdate () {
		$(this.refs.selectpicker).selectpicker({
			styleBase: 'form-control',
			style: '',
			selectedTextFormat: 'static',
			showIcon: true,
			iconBase: 'fa',
			tickIcon: 'fa-check',
		})
	}
	createFilter (props) {
		props = (props || this.props)

		if ( ! props.shared.deviceGroups) return null

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

		var availableFields = this.getFields(props)
		var activeField = this.state.activeField
		var defaultField = props.filter.defaultField
		var field

		if (activeField) {
			field = availableFields[activeField]
		}
		if ( ! field && defaultField) {
			field = _.find(availableFields, (field) => field.name === defaultField)
		}
		if ( ! field) {
			field = _.first(_.values(availableFields))
		}

		return new MeasurementFilterModel()
			.setGrouped(false)
			.setDevices(deviceIDs)
			.addField('timestamp')
			.addField(field.name, field.aggregator)
			.setFrom(from)
			.setTo(to)
			.setInterval(interval)
			.addSort('timestamp', -1)
			.setAttribute('availableFields', availableFields)
	}
	getFields (props) {
		props = (props || this.props)
		var fields = (props.filter.fields || [])
		var field = props.filter.field
		if (field) fields.unshift(field)
		return _.object(
			_.map(fields, (field) => this.getFieldKey(field)),
			fields
		)
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

		this.setState({
			isLoading,
			filter,
			activeField: (filter && this.getFieldKey(filter.getFields()[1]) || ''),
			list: null,
		})

		if (filter) {
			actions.fetchByFilter(filter)
				.then((list) => this.setState({ list, isLoading: false }))
		}
	}
	getFieldKey (field) {
		if (typeof field !== 'object') return ''
		return field.name + '_' + field.aggregator
	}

	getTitle () {
		var filter = this.state.filter
		var field = filter.getFields()[1]
		var availableField = filter.getAttribute('availableFields')[this.getFieldKey(field)]
		return (availableField && availableField.label || field.aggregator + ' ' + field.name)
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
	renderChart (...args) {
		return (
			<div>
				{super.renderChart(...args)}
				{this.renderFieldSelect()}
			</div>
		)
	}
	renderFieldSelect () {
		var filter = this.state.filter
		var activeField = this.state.activeField
		var availableFields = filter.getAttribute('availableFields')

		if (_.size(availableFields) === 1) return

		return (
			<div class="form-inline" style={{
				position: 'absolute',
				top: 0,
				right: 10,
			}}>
				<select
					class="form-control"
					value={activeField}
					onChange={this.onActiveFieldChange.bind(this)}>
				{_.map(availableFields, (field) => {
					var key = this.getFieldKey(field)
					return (<option key={key} value={key}>{field.label}</option>)
				})}
				</select>
				<select
					ref="selectpicker"
					class="bootstrap-select-actions"
					title="Actions"
					onChange={this.onActionChange.bind(this)}>
					<option data-icon="fa-download" value="download">Download</option>
				</select>
			</div>
		)
	}
	onActiveFieldChange (ev) {
		if (this.state.activeField === ev.target.value) return
		this.setState({ isLoading: true, activeField: ev.target.value })
		// Make sure the state has been updated
		setTimeout(() => this.loadData(this.createFilter()), 1)
	}
	onActionChange (ev) {
		ev.preventDefault()

		switch (ev.target.value) {
		case 'download':
			var list = this.state.list
			var columns = list.getColumns()
			var lines = _.chain(list.getValues())
				.map((rows, id) => _.map(rows, (row) => {
					row = _.map(row, (value, i) => {
						if (columns[i] === 'timestamp') return moment.utc(value * 1000).toISOString()
						return Math.round(value * 100) / 100
					})
					row.unshift(id)
					return row
				}))
				.flatten(true)
				.value()
			columns.unshift('station')
			downloadTSV(columns, lines, 'data.' + moment().format('DD-MM-YYYY') + '.tsv')
			break
		default:
			console.error('Invalid action:', ev.target.value)
		}
	}
}

// Override GraphWidget.propTypes
var fieldShape = React.PropTypes.shape({
	name: React.PropTypes.string.isRequired,
	aggregator: React.PropTypes.string.isRequired,
	label: React.PropTypes.string.isRequired,
})

FilterGraphWidget.propTypes = {
	filter: React.PropTypes.shape({
		defaultField: React.PropTypes.string,
		field: fieldShape,
		fields: React.PropTypes.arrayOf(fieldShape),
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
