import React from 'react'
import { instance as user } from '../../lib/user'
import { Link } from 'react-router'

class DashboardIndex extends React.Component {
	getDashboards () {
		return (user.getConfig('dashboards') || [])
	}

	render () {
		return (
			<div>
				<h1>Dashboards</h1>
				<div class="row">
					<div class="col-sm-4">
						<div class="list-group">
							{this.getDashboards().map((dashboard) => (
								<Link key={dashboard.id} class="list-group-item" to={'dashboards/' + dashboard.id}>
									<h4 class="list-group-item-heading">{dashboard.name}</h4>
									<p class="list-group-item-text">{dashboard.description}</p>
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>
		)
	}
}

DashboardIndex.contextTypes = {
	router: React.PropTypes.object.isRequired
}

export default DashboardIndex
