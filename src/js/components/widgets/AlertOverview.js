import _ from 'underscore'
import React from 'react'
import BaseWidget from './Base'

class AlertOverviewWidget extends BaseWidget {
	getDevices () {
		var deviceGroups = this.props.shared.deviceGroups
		if ( ! deviceGroups) return []
		return _.chain(deviceGroups)
			.map((group) => group.devices)
			.flatten()
			.filter((device) => device.include)
			.map((device) => device.id)
			.uniq()
			.value()
	}

	render () {
		if ( ! this.props.shared.deviceGroups) {
			return (<div>Loading…</div>)
		}

		var devices = this.getDevices()

		return (
			<table class="table table-striped table-bordered">
				<thead>
					<tr>
						<th width="160px">Date</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
				{devices.map((udid, i) => (
					<tr key={udid} class={i === 1 ? 'danger' : i === 2 ? 'warning' : ''}>
						<td>15:00 06-02-2017</td>
						<td>Fake alert for {udid}.</td>
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
