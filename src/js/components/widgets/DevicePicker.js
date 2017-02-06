import React from 'react'
import BaseWidget from './Base'
import { instance as user } from '../../lib/user'

class DevicePickerWidget extends BaseWidget {
	constructor () {
		super()
	}

	getDeviceGroups () {
		return this.props.shared.deviceGroups
	}
	componentWillMount () {
		if ( ! this.getDeviceGroups()) {
			this.loadData()
		}
	}
	loadData () {
		setTimeout(() => {
			// TODO(mauvm): Get from redux store
			// TODO(mauvm): Filter on query if this.props.from_query
			// TODO(mauvm): Convert to model (e.g. filter.getUDIDs()) and set shared prop 'deviceFilter'
			var deviceGroups = [
				{
					id: 'testGroup1',
					name: 'Test Group 1',
					devices: [
						{
							id: '0fafd905191c46ae',
							name: 'KUKUA_NGA_00069',
							include: true,
						},
						{
							id: '82891181062246ae',
							name: 'KUKUA_NGA_00070',
							include: true,
						},
						{
							id: '1dcf0ef7112446ae',
							name: 'KUKUA_NGA_00071',
							include: true,
						},
					],
				},
			]
			this.setDeviceGroups(deviceGroups)
		}, 100)
	}
	setDeviceGroups (deviceGroups) {
		this.props.onSetShared('deviceGroups', deviceGroups)
	}
	onDeviceGroupChange (group, include) {
		var deviceGroups = this.getDeviceGroups()
		var deviceGroup = deviceGroups[deviceGroups.indexOf(group)]
		if ( ! deviceGroup) throw new Error('No such device group.')
		deviceGroup.devices.forEach((device) => {
			device.include = include
		})
		this.setDeviceGroups(deviceGroups)
	}
	onDeviceChange (group, device, include) {
		var deviceGroups = this.getDeviceGroups()
		var deviceGroup = deviceGroups[deviceGroups.indexOf(group)]
		if ( ! deviceGroup) throw new Error('No such device group.')
		device = deviceGroup.devices[deviceGroup.devices.indexOf(device)]
		if ( ! device) throw new Error('No such device.')
		device.include = include
		this.setDeviceGroups(deviceGroups)
	}

	render () {
		var deviceGroups = this.getDeviceGroups()

		if ( ! deviceGroups) {
			return (<div>Loading…</div>)
		}

		var deviceLabels = user.getConfig('deviceLabels')

		return (
			<ul>
			{deviceGroups.map((group, i) => (
				<li key={i}>
					<label class="checkbox">
						<input type="checkbox"
							onChange={(ev) => this.onDeviceGroupChange(group, ev.target.checked)}
							checked={group.devices.filter((device) => device.include).length === group.devices.length} />
						{' ' + group.name}
						{ ! this.props.groups_only && group.devices && (
							<ul>
							{group.devices.map((device, i) => (
								<li key={i}>
									<label class="checkbox">
										<input type="checkbox"
											onChange={(ev) => this.onDeviceChange(group, device, ev.target.checked)}
											checked={device.include} />
										{' ' + (deviceLabels[device.id] || device.name)}
									</label>
								</li>
							))}
							</ul>
						)}
					</label>
				</li>
			))}
			</ul>
		)
	}
}

DevicePickerWidget.propTypes = Object.assign({}, BaseWidget.propTypes, {
	from_query: React.PropTypes.bool,
	groups_only: React.PropTypes.bool,
	shared: React.PropTypes.shape({
		deviceGroups: React.PropTypes.array,
	}).isRequired,
})

export default DevicePickerWidget
