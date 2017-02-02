import _ from 'underscore'
import React from 'react'
import moment from 'moment-timezone'
import { instance as user } from '../../lib/user'
import NoMatch from '../noMatch'
import WidgetsOverview from '../widgets/Overview'

class DashboardShow extends React.Component {
	getDashboard () {
		var config = (user.get('config') || {})
		var dashboards = (config.dashboards && config.dashboards.value || [])
		var id = this.props.params.id
		return _.find(dashboards, (dashboard) => dashboard.id === id)
	}

	render () {
		var dashboard = this.getDashboard()

		if ( ! dashboard) return (<NoMatch />)

		var config = {
			widgets: (dashboard.widgets || []),
			from: moment.utc(dashboard.from),
			to: moment.utc(dashboard.to),
			interval: dashboard.interval,
		}

		return (
			<div>
				<h1>{dashboard.name}</h1>
				<WidgetsOverview {...config} />
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
