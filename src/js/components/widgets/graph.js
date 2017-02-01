import React from 'react'

class WidgetGraph extends React.Component {
	render () {
		var widthClass = 'col-md-' + Math.max(1, Math.min(12, this.props.columns * 4))
		var height = Math.max(100, this.props.rows * 200)

		return (
			<div class={widthClass} style={{ height, backgroundColor:'red' }}>
				GRAPH
			</div>
		)
	}
}

WidgetGraph.propTypes = {
	rows: React.PropTypes.number.isRequired,
	columns: React.PropTypes.number.isRequired,
}

export default WidgetGraph
