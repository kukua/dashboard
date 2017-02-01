import _ from 'underscore'
import React from 'react'
import AverageTemperatureGraphWidget from '../widgets/AverageTemperatureGraph'

class DashboardShow extends React.Component {
	render () {
		var devices = ['598deeda123941ae', '82891181062246ae']

		return (
			<div>
				<h1>{_.humanize(this.props.params.id)}</h1>
				<div class="row">
					<AverageTemperatureGraphWidget rows={2} columns={3} devices={devices} />
				</div>
			</div>
		)
	}
}

DashboardShow.propTypes = {
	params: React.PropTypes.shape({
		id: React.PropTypes.string.isRequired,
	}).isRequired,
}
DashboardShow.contextTypes = {
	router: React.PropTypes.object.isRequired
}

export default DashboardShow
