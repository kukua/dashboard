import moment from 'moment-timezone'
import BaseModel from './Base'

class MeasurementFilterModel extends BaseModel {
	setName (name) {
		this.setAttribute('name', name)
		return this
	}
	getName () {
		return this.getAttribute('name') || this.getDevices().join(', ')
	}
	setGrouped (grouped = true) {
		this.setAttribute('grouped', !! grouped)
		return this
	}
	isGrouped () {
		return this.getAttribute('grouped')
	}
	setDevices (devices = []) {
		this.setAttribute('devices', [])
		devices.forEach((udid) => {
			this.addDevice(udid)
		})
		return this
	}
	addDevice (udid) {
		if (typeof udid !== 'string' || ! udid.match(/^[a-z0-9]{16}$/)) {
			throw new Error(`Invalid device ID "${udid}".`)
		}

		var devices = this.getDevices()
		devices.push(udid)
		this.setAttribute('devices', devices)
		return this
	}
	getDevices () {
		return (this.getAttribute('devices') || [])
	}
	setDeviceGroups (groups = []) {
		this.setAttribute('deviceGroups', [])
		groups.forEach((group) => {
			this.addDeviceGroup(group)
		})
		return this
	}
	addDeviceGroup (group) {
		if (typeof group !== 'string' || ! group.match(/^[a-zA-Z0-9]+$/)) {
			throw new Error(`Invalid device group ID "${group}".`)
		}

		var groups = this.getDeviceGroups()
		groups.push(group)
		this.setAttribute('deviceGroups', groups)
		return this
	}
	getDeviceGroups () {
		return (this.getAttribute('deviceGroups') || [])
	}
	setFields (fields = []) {
		this.setAttribute('fields', [])
		fields.forEach(({ name, aggregator }) => {
			this.addField(name, aggregator)
		})
		return this
	}
	addField (name, aggregator = 'avg') {
		if (typeof name !== 'string' || ! name.match(/^[a-zA-Z0-9]+$/)) {
			throw new Error('Invalid field name.')
		}
		if (typeof aggregator !== 'string' || ! aggregator.match(/^[a-z]+$/)) {
			throw new Error('Invalid field aggregator.')
		}

		var fields = this.getFields()
		fields.push({ name, aggregator })
		this.setAttribute('fields', fields)
		return this
	}
	getFields () {
		return (this.getAttribute('fields') || [])
	}
	setFrom (date) {
		if ( ! (date instanceof moment) || ! date.isValid()) {
			throw new Error('Invalid from date.')
		}

		this.setAttribute('from', date)
		return this
	}
	getFrom () {
		return this.getAttribute('from')
	}
	setTo (date) {
		if ( ! (date instanceof moment) || ! date.isValid()) {
			throw new Error('Invalid to date.')
		}

		this.setAttribute('to', date)
		return this
	}
	getTo () {
		return this.getAttribute('to')
	}
	setInterval (interval) {
		if (typeof interval === 'number' && isNaN(interval)) {
			throw new Error('Invalid interval.')
		} else if (typeof interval === 'string' && ! interval) {
			throw new Error('Invalid interval.')
		}

		this.setAttribute('interval', interval)
		return this
	}
	getInterval () {
		return this.getAttribute('interval')
	}
	setSorting (sorting = []) {
		this.setAttribute('sorting', [])
		sorting.forEach(({ name, order }) => {
			this.addSort(name, order)
		})
		return this
	}
	addSort (name, order = 1) {
		if (typeof name !== 'string' || ! name.match(/^[a-zA-Z0-9:]+$/)) {
			throw new Error('Invalid sorting name.')
		}
		if (order !== 1 && order !== -1) {
			throw new Error('Invalid sorting order.')
		}

		var sorting = this.getSorting()
		sorting.push({ name, order })
		this.setAttribute('sorting', sorting)
		return this
	}
	getSorting () {
		return (this.getAttribute('sorting') || [])
	}
	setLimit (limit) {
		if (typeof limit !== 'number' || isNaN(limit)) {
			throw new Error('Invalid limit.')
		}

		this.setAttribute('limit', limit)
		return this
	}
	getLimit () {
		return this.getAttribute('limit')
	}

	toJSON () {
		var from = this.getFrom()
		var to = this.getTo()

		return {
			name: this.getName(),
			grouped: this.isGrouped(),
			devices: this.getDevices(),
			deviceGroups: this.getDeviceGroups(),
			fields: this.getFields(),
			from: (from ? from.toISOString() : null),
			to: (to ? to.toISOString() : null),
			interval: this.getInterval(),
			sort: this.getSorting(),
			limit: this.getLimit(),
		}
	}
}

MeasurementFilterModel.create = (data) => {
	var filter = new MeasurementFilterModel()

	if (data.grouped !== undefined) {
		filter.setGrouped(data.grouped)
	}
	if (data.devices) {
		filter.setDevices(data.devices)
	}
	var deviceGroups = data.device_groups || data.deviceGroups
	if (deviceGroups) {
		filter.setDeviceGroups(deviceGroups)
	}
	filter.setFields(data.fields)
	if (data.from) {
		filter.setFrom(moment.utc(data.from))
	}
	if (data.to) {
		filter.setTo(moment.utc(data.to))
	}
	filter.setInterval(data.interval)
	filter.setSorting(data.sort)
	if (data.limit) {
		filter.setLimit(data.limit)
	}

	return filter
}

export default MeasurementFilterModel
