import _ from 'underscore'
import React from 'react'
import BaseWidget from './Base'
import { instance as user } from '../../lib/user'

class AlertOverviewWidget extends BaseWidget {
	getDevices () {
		var deviceGroups = this.props.shared.deviceGroups
		if ( ! deviceGroups) return []
		return _.chain(deviceGroups)
			.map((group) => group.getDevices())
			.flatten()
			.filter((device) => device.getAttribute('include'))
			.uniq(false, (device) => device.id)
			.value()
	}

	render () {
		if ( ! this.props.shared.deviceGroups) {
			return (<div>Loading…</div>)
		}

		var devices = this.getDevices()
		var deviceLabels = user.getConfig('deviceLabels') || {}

		return (
			<table class="table table-striped table-bordered">
				<thead>
					<tr>
						<th width="160px">Date</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
				{devices.map((device, i) => (
					<tr key={device.id} class={i === 1 ? 'danger' : i === 2 ? 'warning' : ''}>
						<td>15:00 06-02-2017</td>
						<td>Fake alert for {deviceLabels[device.id] || device.name}.</td>
					</tr>
				))}
				</tbody>
			</table>
		)
	}
}

AlertOverviewWidget.propTypes.shared = React.PropTypes.shape({
	deviceGroups: React.PropTypes.array,
}).isRequired

export default AlertOverviewWidget
