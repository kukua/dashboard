import React from 'react'

class DashboardIndex extends React.Component {
	componentWillMount () {
		this.context.router.replace('/dashboards/test')
	}

	render () {
		return (
			<div>
				<h1>Dashboards</h1>
			</div>
		)
	}
}

DashboardIndex.contextTypes = {
	router: React.PropTypes.object.isRequired
}

export default DashboardIndex
