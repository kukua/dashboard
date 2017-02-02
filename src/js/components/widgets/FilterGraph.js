import _ from 'underscore'
import Promise from 'bluebird'
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

class FilterGraphWidget extends Graph {
	loadData () {
		Promise.all(this.props.filters.map((filter) => (
			this.props.onFetchByFilter(filter)
				.then((list) => list, (err) => {
					console.error(err)
					return null
				})
		))).then((lists) => {
			this.setState({ lists: _.compact(lists), isLoading: false })
		})
	}
	componentWillMount () {
		this.loadData()
	}

	getYAxisLabel () {
		return this.props.label
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

FilterGraphWidget.propTypes = {
	onFetchByFilter: React.PropTypes.func.isRequired,
	label: React.PropTypes.string,
	filters: React.PropTypes.arrayOf(React.PropTypes.instanceOf(MeasurementFilterModel)).isRequired,
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(FilterGraphWidget)
