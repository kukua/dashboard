import _ from 'underscore'
import Promise from 'bluebird'
import moment from 'moment-timezone'
import React from 'react'
import { connect } from 'react-redux'
import Graph from './Graph'
import actions from '../../actions/measurement'
import MeasurementFilterModel from '../../models/MeasurementFilter'
import MeasurementListModel from '../../models/MeasurementList'

const mapStateToProps = (/*state*/) => {
	return {}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onFetchByFilter (filter) {
			return dispatch(actions.fetchByFilter(filter))
		}
	}
}

class AverageTemperatureGraphWidget extends Graph {
	loadData () {
		Promise.all(this.props.devices.map((udid) => {
			try {
				var filter = new MeasurementFilterModel()
				filter.addDevice(udid)
				filter.addField('temp')
				filter.addSort('timestamp', -1)
				filter.setFrom(moment.utc('2017-01-01T00:00:00Z'))
				filter.setTo(moment.utc('2017-01-31T23:59:59Z'))
				filter.setInterval('1h')

				return this.props.onFetchByFilter(filter)
					.then((list) => list, (err) => {
						console.error(err)
						return null
					})
			} catch (err) {
				console.error(err)
			}
		})).then((lists) => {
			this.setState({ lists: _.compact(lists), isLoading: false })
		})
	}
	componentWillMount () {
		this.loadData()
	}

	getYAxisTitle () {
		return 'Average temperature (°C)'
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

		return list.getFilter().getDevices()[0]
	}
}

AverageTemperatureGraphWidget.propTypes = {
	rows: React.PropTypes.number.isRequired,
	columns: React.PropTypes.number.isRequired,
	devices: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AverageTemperatureGraphWidget)
