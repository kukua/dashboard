import React from 'react'
import ReactHighcharts from 'react-highcharts'
import BaseWidget from './Base'

class GraphWidget extends BaseWidget {
	constructor () {
		super()
		this.state = {
			isLoading: true,
		}
	}

	componentWillMount () {
		this.setState({ isLoading: false })
	}

	getConfig (height) {
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
				useHTML: true,
				valueSuffix: '',
				dateTimeLabelFormats: {
					millisecond: '%H:%M %d-%m-%Y',
					second: '%H:%M %d-%m-%Y',
					minute: '%H:%M %d-%m-%Y',
					hour: '%H:%M %d-%m-%Y',
					day: '%H:%M %d-%m-%Y',
					week: '%H:%M %d-%m-%Y',
					month: '%H:%M %d-%m-%Y',
					year: '%H:%M %d-%m-%Y',
				},
			},
			legend: {
				enabled: false,
			},
			chart: {
				height,
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
					marker: {
						enabled: false,
					},
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
					text: this.getYAxisLabel(),
				}
			},
			series: this.getSeries(),
		}
	}
	getYAxisTitle () {
		return ''
	}
	getSeries () {
		return this.props.series
	}

	renderWarning () {}
	render () {
		var height = 400
		var body = this.renderWarning(height)

		if ( ! body && this.state.isLoading) {
			body = (<span>Loading…</span>)
		}

		if ( ! body) {
			var config = this.getConfig(height)

			if (config.series.length > 0) {
				body = (<ReactHighcharts config={config} />)
			} else {
				body = (<div class="alert alert-warning">No measurements.</div>)
			}
		}

		return (<div style={{ height }}>{body}</div>)
	}
}

GraphWidget.propTypes = {
	series: React.PropTypes.array.isRequired,
}

export default GraphWidget
