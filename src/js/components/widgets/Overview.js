import _ from 'underscore'
import Promise from 'bluebird'
import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment-timezone'
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

class WidgetsOverview extends React.Component {
	constructor () {
		super()
		this.state = {
			isLoading: true,
		}
	}

	loadData () {
		var from = this.props.from
		var to = this.props.to
		var interval = this.props.interval

		Promise.all(this.props.widgets.map((config) => {
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
				{this.state.isLoading
					? 'Loading…'
					: this.getWidgets()
				}
			</div>
		)
	}
}


WidgetsOverview.propTypes = {
	onFetchByID: React.PropTypes.func.isRequired,
	widgets: React.PropTypes.array.isRequired,
	from: React.PropTypes.instanceOf(moment).isRequired,
	to: React.PropTypes.instanceOf(moment).isRequired,
	interval: React.PropTypes.oneOfType([
		React.PropTypes.number,
		React.PropTypes.string,
	]).isRequired,
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(WidgetsOverview)
