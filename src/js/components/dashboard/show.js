import _ from 'underscore'
import React from 'react'
import moment from 'moment-timezone'
import WidgetsOverview from '../widgets/Overview'

class DashboardShow extends React.Component {
	render () {
		var widgets = [
			{
				columns: 3,
				title: 'Average temperature (°C)',
				filter: {
					deviceGroup: 'testGroup1',
					field: {
						name: 'temp',
						aggregator: 'avg',
					},
				},
			},
			{
				columns: 4,
				title: 'Maximum wind speed (km/h)',
				filter: {
					deviceGroup: 'testGroup1',
					field: {
						name: 'windSpeed',
						aggregator: 'max',
					},
				},
			},
		]
		var from = moment.utc('2017-01-01T00:00:00Z')
		var to = moment.utc('2017-01-31T23:59:59Z')
		var interval = '1h'

		return (
			<div>
				<h1>{_.humanize(this.props.params.id)} dashboard</h1>
				<WidgetsOverview widgets={widgets} from={from} to={to} interval={interval} />
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
