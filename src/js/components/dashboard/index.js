import React from 'react'
import { instance as user } from '../../lib/user'
import { Link } from 'react-router'

class DashboardIndex extends React.Component {
	getDashboards () {
		var config = (user.get('config') || {})
		return (config.dashboards && config.dashboards.value || [])
	}

	render () {
		var dashboards = this.getDashboards()

		return (
			<div>
				<h1>Dashboards</h1>
				<ul>
					{dashboards.map((dashboard) => (
						<li key={dashboard.id}>
							<Link to={'dashboards/' + dashboard.id}>{dashboard.name}</Link>
						</li>
					))}
				</ul>
			</div>
		)
	}
}

DashboardIndex.contextTypes = {
	router: React.PropTypes.object.isRequired
}

export default DashboardIndex
