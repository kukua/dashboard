import _ from 'underscore'
import React from 'react'
import Graph from '../widgets/graph'

class DashboardShow extends React.Component {
	render () {
		var measurementFilter = null

		return (
			<div>
				<h1>{_.humanize(this.props.params.id)}</h1>
				<div class="row">
					<Graph rows={2} columns={3} measurementFilter={measurementFilter} />
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
