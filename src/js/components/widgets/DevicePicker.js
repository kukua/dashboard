import _ from 'underscore'
import React from 'react'
import { connect } from 'react-redux'
import actions from '../../actions/deviceGroup'
import BaseWidget from './Base'
import { instance as user } from '../../lib/user'
import Checkbox from 'rc-checkbox'

import 'rc-checkbox/assets/index.css'

const mapStateToProps = (state) => {
	var { loading: isFetching, items = [] } = state.deviceGroup.fetchAll
	return { isFetching, items }
}

const mapDispatchToProps = (dispatch) => {
	return {
		onFetchAll () {
			return dispatch(actions.fetchAll())
		},
	}
}

class DevicePickerWidget extends BaseWidget {
	getDeviceGroups () {
		return this.props.shared.deviceGroups
	}
	componentWillMount () {
		if ( ! this.getDeviceGroups()) {
			this.loadData()
		}
	}
	loadData () {
		if (this.props.items.length > 0) {
			this.onDeviceGroups(this.props.items)
		} else {
			this.props.onFetchAll().then(this.onDeviceGroups.bind(this))
		}
	}
	onDeviceGroups (deviceGroups) {
		// TODO(mauvm): Filter on query if this.props.from_query
		// TODO(mauvm): Convert to model (e.g. filter.getUDIDs()) and set shared prop 'deviceFilter'

		deviceGroups.forEach((group) => {
			group.getDevices().forEach((device) => {
				device.setAttribute('include', true)
			})
		})

		var deviceCount = _.reduce(
			deviceGroups.map((group) => group.getDevices().length),
			(memo, num) => memo + num,
			0
		)

		var closed = (deviceCount > 20)
		deviceGroups.forEach((group) => group.setAttribute('closed', closed))

		this.setDeviceGroups(deviceGroups)
	}
	setDeviceGroups (deviceGroups) {
		this.props.onSetShared('deviceGroups', deviceGroups)
	}
	onToggleAll () {
		var deviceGroups = this.getDeviceGroups()
		var include = ! this.getInfo(deviceGroups).allIncluded
		deviceGroups.map((group) => {
			group.getDevices().forEach((device) => {
				device.setAttribute('include', include)
			})
		})
		this.setDeviceGroups(deviceGroups)
	}
	onDeviceGroupChange (group, include) {
		var deviceGroups = this.getDeviceGroups()
		var deviceGroup = deviceGroups[deviceGroups.indexOf(group)]
		if ( ! deviceGroup) throw new Error('No such device group.')
		deviceGroup.getDevices().forEach((device) => {
			device.setAttribute('include', include)
		})
		this.setDeviceGroups(deviceGroups)
	}
	onDeviceChange (group, device, include) {
		var deviceGroups = this.getDeviceGroups()
		var deviceGroup = deviceGroups[deviceGroups.indexOf(group)]
		if ( ! deviceGroup) throw new Error('No such device group.')
		var devices = deviceGroup.getDevices()
		device = devices[devices.indexOf(device)]
		if ( ! device) throw new Error('No such device.')
		device.setAttribute('include', include)
		this.setDeviceGroups(deviceGroups)
	}
	getInfo (deviceGroups) {
		var devices
		if (Array.isArray(deviceGroups)) {
			devices = _.chain(deviceGroups)
				.map((group) => group.getDevices())
				.flatten()
				.value()
		} else {
			// Single device group
			devices = deviceGroups.getDevices()
		}
		var includedDevices = devices.filter((device) => device.getAttribute('include'))
		var allIncluded = (includedDevices.length === devices.length)
		var labelClass = 'label-default'

		if (allIncluded) {
			labelClass = 'label-success'
		} else if (includedDevices.length > 0) {
			labelClass = 'label-warning'
		}

		var Label = (
			<span class={'label pull-right ' + labelClass}
				style={{ marginTop: 6 }}>
				{includedDevices.length} / {devices.length}
			</span>
		)

		return { allIncluded, Label }
	}

	render () {
		var deviceGroups = this.getDeviceGroups()

		if (this.props.isFetching || ! deviceGroups) {
			return (<div>Loading…</div>)
		}

		var deviceLabels = user.getConfig('deviceLabels')
		var info = this.getInfo(deviceGroups)

		return (
			<ul style={{
				listStyleType: 'none',
				margin: '0 0 20px',
				padding: 0,
			}}>
				<li style={{ lineHeight: '26px' }}>
					<Checkbox
						style={{ marginLeft: (this.props.groups_only ? 0 : 34), marginRight: 8 }}
						onChange={() => this.onToggleAll()}
						checked={info.allIncluded} />
					{' All'}
					{info.Label}
				</li>
			{deviceGroups.map((group, i) => {
				var info = this.getInfo(group)
				var closed = !! group.getAttribute('closed')

				return (
					<li key={i} style={{ lineHeight: '26px' }}>
						{ ! this.props.groups_only && (
							<button class="btn btn-xs btn-default" style={{ marginRight: 10 }} onClick={() => {
								group.setAttribute('closed', ! closed)
								this.setDeviceGroups(deviceGroups)
							}}>
								<i class={'fa ' + (closed ? 'fa-chevron-down' : 'fa-chevron-up')} />
							</button>
						)}
						<Checkbox
							style={{ marginRight: 8 }}
							onChange={(ev) => this.onDeviceGroupChange(group, ev.target.checked)}
							checked={info.allIncluded} />
						{' ' + group.name}
						{info.Label}
						{ ! this.props.groups_only
							&& group.getDevices().length > 0
							&& ! closed
							&& (
							<ul style={{
								listStyleType: 'none',
								margin: '-4px 0 0 34px',
								padding: 0,
							}}>
							{group.getDevices().map((device, i) => (
								<li key={i} style={{

								}}>
									<label class="checkbox" style={{ margin: '6px 0' }}>
										<Checkbox
											style={{ marginRight: 8 }}
											onChange={(ev) => this.onDeviceChange(group, device, ev.target.checked)}
											checked={device.getAttribute('include')} />
										{' ' + (deviceLabels[device.id] || device.name)}
									</label>
								</li>
							))}
							</ul>
						)}
					</li>
				)
			})}
			</ul>
		)
	}
}

DevicePickerWidget.propTypes = Object.assign({}, BaseWidget.propTypes, {
	onFetchAll: React.PropTypes.func.isRequired,
	isFetching: React.PropTypes.bool.isRequired,
	items: React.PropTypes.array.isRequired,
	from_query: React.PropTypes.bool,
	groups_only: React.PropTypes.bool,
	shared: React.PropTypes.shape({
		deviceGroups: React.PropTypes.array,
	}).isRequired,
})

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(DevicePickerWidget)
