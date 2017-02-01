import _ from 'underscore'
import Promise from 'bluebird'
import moment from 'moment-timezone'
import React from 'react'
import { connect } from 'react-redux'
import ReactHighcharts from 'react-highcharts'
import actions from '../../actions/measurement'
import MeasurementFilter from '../../models/MeasurementFilter'

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

class WidgetGraph extends React.Component {
	constructor () {
		super()
		this.state = {}
	}

	loadData () {
		var devices = ['598deeda123941ae', '82891181062246ae']

		Promise.all(devices.map((udid) => {
			var filter = new MeasurementFilter()
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
		})).then((lists) => {
			this.setState({ lists: _.compact(lists) })
		})
	}
	componentWillMount () {
		this.loadData()
	}

	getConfig () {
		return {
			title: {
				text: '',
				align: 'left',
				style: {
					fontSize: '26px',
					fontFamily: 'Asap, Trebuchet MS',
				},
			},
			tooltip: {
				shared: true,
				valueSuffix: '',
			},
			legend: {
				align: 'center',
				verticalAlign: 'bottom',
				layout: 'horizontal',
			},
			chart: {
				style: {
					fontFamily: 'Trebuchet MS',
				},
				zoomType: 'x',
			},
			plotOptions: {
				series: {
					cropTreshhold: 5000,
					states: {
						hover: {
							enabled: false,
						},
					},
				},
				line: {
					turboThreshold: 5000,
					lineWidth: 1,
				},
			},
			credits: {
				enabled: false,
			},
			xAxis: {
				type: 'datetime',
				labels: {
					rotation: -45,
					align: 'right',
				},
				title: {
					text: 'Timestamp',
				},
				crosshair: true,
				alternateGridColor: '#f7f7f7',
				dateTimeLabelFormats: {
					millisecond: '%H:%M:%S.%L',
					second: '%H:%M:%S',
					minute: '%H:%M',
					hour: '%H:%M',
					day: '%d-%m-%Y',
					week: 'week %U',
					month: '%m-%Y',
					year: '%Y',
				},
			},
			yAxis: {
				title: {
					text: 'Average temperature (°C)',
				}
			},
			series: this.getSeries(),
		}
	}
	getSeries () {
		var lists = this.state.lists

		if ( ! Array.isArray(lists) || lists.length === 0) return []

		return lists.map((list) => {
			var columns = list.getColumns()

			return {
				name: list.getFilter().getDevices()[0],
				data: list.getValues().map((row) => row.map((value, j) => {
					if (columns[j] === 'timestamp') return value * 1000
					return Math.round(value * 100) / 100
				})),
			}
		})
	}

	render () {
		var widthClass = 'col-md-' + Math.max(1, Math.min(12, this.props.columns * 4))
		var height = Math.max(100, this.props.rows * 200)
		var config = this.getConfig()

		if (config.series.length === 0) {
			var message = (this.state.lists ? 'No measurements.' : 'Loading…')
			return (<div class={widthClass} style={{ height }}>{message}</div>)
		}

		return (
			<div class={widthClass} style={{ height }}>
				<ReactHighcharts config={config} />
			</div>
		)
	}
}

WidgetGraph.propTypes = {
	onFetchByFilter: React.PropTypes.func.isRequired,
	rows: React.PropTypes.number.isRequired,
	columns: React.PropTypes.number.isRequired,
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(WidgetGraph)
