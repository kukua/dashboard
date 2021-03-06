import React from 'react'
import ReactHighcharts from 'react-highcharts'
import BaseWidget from './Base'

// http://stackoverflow.com/a/17853889/1453912
ReactHighcharts.Highcharts.dateFormats = {
	W: function (timestamp) {
		var date = new Date(timestamp)
		var day = date.getUTCDay() == 0 ? 7 : date.getUTCDay()
		var dayNumber
		date.setDate(date.getUTCDate() + 4 - day)
		dayNumber = Math.floor((date.getTime() - new Date(date.getUTCFullYear(), 0, 1, -6)) / 86400000)
		return 1 + Math.floor(dayNumber / 7)
	}
}

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
				text: this.getTitle(),
				align: 'left',
				style: {
					fontSize: '14px',
					fontWeight: 'bold',
					fontFamily: '"Source Sans Pro", "Helvetica Neue", Helvetica, Arial, sans-serif',
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
					text: '',
				},
				crosshair: true,
				alternateGridColor: '#f7f7f7',
				dateTimeLabelFormats: {
					millisecond: '%H:%M:%S.%L',
					second: '%H:%M:%S',
					minute: '%H:%M',
					hour: '%H:%M',
					day: '%d-%m-%Y',
					week: 'week %W / %Y',
					month: '%m-%Y',
					year: '%Y',
				},
			},
			yAxis: {
				title: {
					text: '',
				},
			},
			series: this.getSeries(),
		}
	}
	getTitle () {
		return ''
	}
	getSeries () {
		return this.props.series
	}

	renderChart (config) {
		return (<ReactHighcharts config={config} />)
	}

	renderWarning () {}
	render () {
		var body, height = 400

		if (this.state.isLoading) {
			body = (<span>Loading…</span>)
		}
		if ( ! body) {
			body = this.renderWarning(height)
		}

		if ( ! body) {
			var config = this.getConfig(height)

			if (config.series.length > 0) {
				body = this.renderChart(config)
			} else {
				body = (<div class="alert alert-warning">No measurements.</div>)
			}
		}

		return (<div style={{ height, position: 'relative' }}>{body}</div>)
	}
}

GraphWidget.propTypes = {
	series: React.PropTypes.array.isRequired,
}

export default GraphWidget
