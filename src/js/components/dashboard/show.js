import _ from 'underscore'
import Promise from 'bluebird'
import moment from 'moment-timezone'
import React from 'react'
import { connect } from 'react-redux'
import actions from '../../actions/deviceGroup'
import MeasurementFilterModel from '../../models/MeasurementFilter'
import FilterGraph from '../widgets/FilterGraph'

const mapStateToProps = (/*state*/) => {
	return {}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onFetchByID (id) {
			return dispatch(actions.fetchByID(id))
		}
	}
}

class DashboardShow extends React.Component {
	constructor () {
		super()
		this.state = {
			isLoading: true,
		}
	}

	loadData () {
		var widgets = [
			{
				columns: 3,
				title: 'Average temperature (°C)',
				filter: {
					deviceGroup: 'testGroup1',
					field: {
						name: 'temp',
						aggregator: 'avg',
					},
				},
			},
			{
				columns: 4,
				title: 'Maximum wind speed (km/h)',
				filter: {
					deviceGroup: 'testGroup1',
					field: {
						name: 'windSpeed',
						aggregator: 'max',
					},
				},
			},
		]
		var from = moment.utc('2017-01-01T00:00:00Z')
		var to = moment.utc('2017-01-31T23:59:59Z')
		var interval = '1h'

		Promise.all(widgets.map((config) => {
			var widget = {}
			var f = config.filter
			widget.columns = Math.min(4, config.columns || 4)
			widget.title = config.title || ''

			return this.props.onFetchByID(f.deviceGroup)
				.then((group) => group.getDevices().map((device) => {
					var filter = new MeasurementFilterModel()
					filter.setName(device.name)
					filter.setDevices([device.id])
					filter.addField(f.field.name, f.field.aggregator)
					filter.setFrom(from)
					filter.setTo(to)
					filter.setInterval(interval)
					filter.addSort('timestamp', -1)
					return filter
				}))
				.then((filters) => {
					widget.filters = filters
					return widget
				})
		})).then((widgets) => {
			//console.log(widgets)
			this.setState({ widgets, isLoading: false })
		})
	}
	componentWillMount () {
		this.loadData()
	}

	getWidgets () {
		var rows = [[]]
		var columnCount = (row) => _.chain(row)
			.map((column) => column[0])
			.reduce((memo, num) => memo + num, 0)
			.value()

		this.state.widgets.forEach((widget, i) => {
			var row = rows[rows.length - 1]
			if (columnCount(row) + widget.columns > 4) {
				// New row
				rows.push([])
				row = rows[rows.length - 1]
			}
			row.push([widget.columns, <FilterGraph key={i} rows={2} {...widget} />])
		})

		return rows.map((columns, i) => <div key={i} class="row">{columns.map((column) => column[1])}</div>)
	}

	render () {
		return (
			<div>
				<h1>{_.humanize(this.props.params.id)} dashboard</h1>
				{this.state.isLoading
					? 'Loading…'
					: this.getWidgets()
				}
			</div>
		)
	}
}

DashboardShow.propTypes = {
	onFetchByID: React.PropTypes.func.isRequired,
	params: React.PropTypes.shape({
		id: React.PropTypes.string.isRequired,
	}).isRequired,
}
DashboardShow.contextTypes = {
	router: React.PropTypes.object.isRequired
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(DashboardShow)