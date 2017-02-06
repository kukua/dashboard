import _ from 'underscore'
import React from 'react'
import ControlsWidget from '../widgets/Controls'
import DevicePickerWidget from '../widgets/DevicePicker'
import AlertOverviewWidget from '../widgets/AlertOverview'
import FilterGraphWidget from '../widgets/FilterGraph'
import NotFoundWidget from '../widgets/NotFound'

const availableWidgets = {
	'controls': ControlsWidget,
	'device-picker': DevicePickerWidget,
	'alert-overview': AlertOverviewWidget,
	'filter-graph': FilterGraphWidget,
}

class WidgetsOverview extends React.Component {
	constructor () {
		super()
		this.state = {
			shared: {},
		}
	}

	onSetShared (key, value) {
		var shared = this.state.shared
		shared[key] = value
		this.setState({ shared })
	}

	render () {
		var rows = [[]]
		var columnCount = (row) => _.chain(row)
			.map((column) => column[0])
			.reduce((memo, num) => memo + num, 0)
			.value()

		this.props.widgets.forEach((widget, i) => {
			var row = rows[rows.length - 1]
			widget.columns = Math.min(4, widget.columns || 4)
			if (columnCount(row) + widget.columns > 4) {
				// New row
				rows.push([])
				row = rows[rows.length - 1]
			}

			var Widget = availableWidgets[widget.type] || NotFoundWidget
			var widthClass = 'col-md-' + Math.max(1, Math.min(12, widget.columns * 3))
			var Container = (
				<div key={i} class={widthClass}>
					<Widget {...widget} shared={this.state.shared} onSetShared={(key, value) => this.onSetShared(key, value)} />
				</div>
			)
			row.push([widget.columns, Container])
		})

		return (
			<div>
				{rows.map((columns, i) => <div key={i} class="row">{columns.map((column) => column[1])}</div>)}
			</div>
		)
	}
}

WidgetsOverview.propTypes = {
	widgets: React.PropTypes.array.isRequired,
}

export default WidgetsOverview
