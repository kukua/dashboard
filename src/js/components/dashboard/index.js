import _ from 'underscore'
import React from 'react'
import { current as user } from '../../models/User'
import { Link } from 'react-router'

class DashboardIndex extends React.Component {
	getDashboards () {
		return (user.getConfig('dashboards') || [])
	}

	render () {
		return (
			<div>
				<h1>Dashboards</h1>
				{_.chain(this.getDashboards())
					.groupBy((d, i) => Math.floor(i / 3))
					.toArray()
					.map((dashboards, i) => (
						<div key={i} class="row">
						{dashboards.map((dashboard) => (
							<div key={dashboard.id} class="col-sm-4">
								<Link
									class="list-group-item"
									style={{ minHeight: 100 }}
									to={'dashboards/' + dashboard.id}>
									<h4 class="list-group-item-heading">{dashboard.name}</h4>
									<p class="list-group-item-text">{dashboard.description}</p>
								</Link>
							</div>
						))}
						</div>
					))
					.value()}
			</div>
		)
	}
}

DashboardIndex.contextTypes = {
	router: React.PropTypes.object.isRequired
}

export default DashboardIndex
