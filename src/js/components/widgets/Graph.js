import React from 'react'
import ReactHighcharts from 'react-highcharts'

class GraphWidget extends React.Component {
	constructor () {
		super()
		this.state = {
			isLoading: true,
		}
	}

	componentWillMount () {
		this.setState({ isLoading: false })
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
					text: this.getYAxisTitle(),
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

	render () {
		var widthClass = 'col-md-' + Math.max(1, Math.min(12, this.props.columns * 3))
		var height = Math.max(200, this.props.rows * 200)

		return (
			<div class={widthClass} style={{ height }}>
				{this.state.isLoading
					? 'Loading…'
					: <ReactHighcharts config={this.getConfig()} />
				}
			</div>
		)
	}
}

GraphWidget.propTypes = {
	rows: React.PropTypes.number.isRequired,
	columns: React.PropTypes.number.isRequired,
	series: React.PropTypes.array.isRequired,
}

export default GraphWidget
