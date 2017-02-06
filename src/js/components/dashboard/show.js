import _ from 'underscore'
import React from 'react'
import { instance as user } from '../../lib/user'
import NoMatch from '../noMatch'
import WidgetsOverview from '../widgets/Overview'

class DashboardShow extends React.Component {
	componentWillMount () {
		this.checkDefault(this.props)
	}
	componentWillReceiveProps (next) {
		this.checkDefault(next)
	}
	checkDefault () {
		if (this.props.params.id === 'default') {
			var dashboard = _.find(
				this.getDashboards(),
				(dashboard) => dashboard.default === true
			)
			this.context.router.replace(dashboard ? '/dashboards/' + dashboard.id : '/dashboards')
		}
	}

	getDashboards () {
		return (user.getConfig('dashboards') || [])
	}
	getDashboard () {
		var id = this.props.params.id
		return _.find(this.getDashboards(), (dashboard) => dashboard.id === id)
	}

	render () {
		var dashboard = this.getDashboard()

		if ( ! dashboard) return (<NoMatch />)

		return (
			<div>
				<h1>{dashboard.name}</h1>
				<WidgetsOverview widgets={dashboard.widgets || []} />
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
