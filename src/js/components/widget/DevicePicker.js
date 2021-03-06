import _ from 'underscore'
import React from 'react'
import { connect } from 'react-redux'
import actions from '../../actions/deviceGroup'
import BaseWidget from './Base'
import { current as user } from '../../models/User'
import Checkbox from 'rc-checkbox'

import 'rc-checkbox/assets/index.css'

const mapStateToProps = (state) => {
	var { loading: isFetching, items } = state.deviceGroup.fetchAll
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
	constructor () {
		super()
		this.state = {
			deviceGroups: null,
		}
	}
	componentWillMount () {
		if (this.props.shared.deviceGroups || this.props.items) {
			this.onDeviceGroups(this.props)
		} else {
			this.props.onFetchAll()
		}
	}
	componentWillReceiveProps (next) {
		var deviceGroups = (next.shared.deviceGroups || next.items)

		if (deviceGroups && deviceGroups !== this.state.deviceGroups) {
			this.onDeviceGroups(next)
		}
	}
	onDeviceGroups (props) {
		// TODO(mauvm): Convert deviceGroups to model (e.g. filter.getUDIDs())
		// and set shared prop 'deviceFilter'

		var deviceGroups = (props.shared.deviceGroups || props.items)
		var filter = this.getDefaultFilter(props)
		if (props.fromURL) {
			var urlFilter = this.getURLFilter()
			if ( ! urlFilter.defaultValues) Object.assign(filter, urlFilter)
		}

		if (props.filterDeviceGroups) {
			deviceGroups = _.filter(deviceGroups, (group) => _.contains(props.filterDeviceGroups, group.id))
		}

		deviceGroups.forEach((group) => {
			var includeGroup = filter.deviceGroups[group.id]

			if (includeGroup === undefined) {
				includeGroup = filter.includeByDefault
			}

			group.getDevices().forEach((device) => {
				var includeDevice

				if ( ! props.groupsOnly) {
					includeDevice = filter.devices[device.id]
				}

				var include = (includeDevice !== undefined ? includeDevice : includeGroup)
				device.setAttribute('include', include)
			})
		})

		var deviceCount = _.reduce(
			deviceGroups.map((group) => group.getDevices().length),
			(memo, num) => memo + num,
			0
		)

		var closed = (deviceCount > 20)
		deviceGroups.forEach((group) => group.setAttribute('closed', closed))

		this.setState({ deviceGroups })
		this.setDeviceGroups(deviceGroups)
	}
	setDeviceGroups (deviceGroups) {
		this.setURLFilter(deviceGroups)
		this.props.onSetShared('deviceGroups', deviceGroups)
	}
	getDeviceGroups () {
		return this.state.deviceGroups
	}
	getDefaultFilter (props) {
		props = (props || this.props)
		var defaultFilter = (props.defaultFilter || {})
		var includeByDefault = (defaultFilter.allDevices !== undefined
			? !! defaultFilter.allDevices
			: true)

		return {
			includeByDefault,
			deviceGroups: (Array.isArray(defaultFilter.deviceGroups)
				? _.object(
					defaultFilter.deviceGroups,
					new Array(defaultFilter.deviceGroups.length).fill( ! includeByDefault)
				)
				: {}),
			devices: (Array.isArray(defaultFilter.devices)
				? _.object(
					defaultFilter.devices,
					new Array(defaultFilter.devices.length).fill( ! includeByDefault)
				)
				: {}),
		}
	}
	getURLFilter () {
		var query = this.context.location.query
		var { allDevices, deviceGroups, devices } = query
		var defaultValues = (
			allDevices === undefined &&
			deviceGroups === undefined &&
			devices === undefined
		)
		if (allDevices === undefined) allDevices = 1
		var includeByDefault = !! parseInt(allDevices)
		var create = (items = '') => _.chain(items.split(','))
			.filter((id) => id)
			.map((id) => [id, ! includeByDefault])
			.object()
			.value()

		deviceGroups = create(deviceGroups)
		devices = create(devices)

		return { includeByDefault, deviceGroups, devices, defaultValues }
	}
	setURLFilter (deviceGroups) {
		// Create shortest possible query parameters
		// Determine filtering all
		var averages = _.chain(deviceGroups)
			.map((group) => _.filter(group.getDevices(), (device) => device.getAttribute('include')).length / group.getDevices().length)
			.value()
		var sum = _.reduce(averages, (memo, num) => memo + num, 0)
		var allDevices = (sum > 0 && sum / averages.length >= 0.5)

		// Determine device group and device filters
		var filteredDeviceGroups = []
		var filteredDevices = []

		deviceGroups.forEach((group, i) => {
			if (averages[i] === (allDevices ? 0 : 1)) {
				filteredDeviceGroups.push(group.id)
			} else {
				// Determine device filters
				group.getDevices().forEach((device) => {
					if (device.getAttribute('include') !== allDevices) {
						filteredDevices.push(device.id)
					}
				})
			}
		})

		var location = this.context.location
		var query = Object.assign({}, location.query)
		query.allDevices = (allDevices ? 1 : 0)
		query.deviceGroups = (filteredDeviceGroups.join(',') || undefined)
		query.devices = (filteredDevices.join(',') || undefined)

		var route = Object.assign({}, location, {
			pathname: (location.pathname.startsWith('/') ? '' : '/') + location.pathname,
			query,
		})
		this.context.router.push(route)
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
				.uniq(false, (device) => device.id)
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

		var deviceLabels = user.getConfig('deviceLabels') || {}
		var info = this.getInfo(deviceGroups)

		return (
			<ul style={{
				listStyleType: 'none',
				margin: '0 0 20px',
				padding: 0,
			}}>
				<li style={{ lineHeight: '26px' }}>
					<Checkbox
						style={{ marginLeft: (this.props.groupsOnly ? 0 : 34), marginRight: 8 }}
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
						{ ! this.props.groupsOnly && (
							<button class="btn btn-xs btn-default" style={{ marginRight: 10 }} onClick={() => {
								group.setAttribute('closed', ! closed)
								this.forceUpdate()
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
						{ ! this.props.groupsOnly
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
										<span title={`${device.name} (${device.id})`}>
											{' ' + (deviceLabels[device.id] || device.name)}
										</span>
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
	items: React.PropTypes.array,
	fromURL: React.PropTypes.bool,
	groupsOnly: React.PropTypes.bool,
	filterDeviceGroups: React.PropTypes.array,
	defaultFilter: React.PropTypes.shape({
		allDevices: React.PropTypes.bool,
		deviceGroups: React.PropTypes.array,
		devices: React.PropTypes.array,
	}),
	shared: React.PropTypes.shape({
		deviceGroups: React.PropTypes.array,
	}).isRequired,
})
DevicePickerWidget.contextTypes = {
	location: React.PropTypes.object,
	router: React.PropTypes.object,
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(DevicePickerWidget)
