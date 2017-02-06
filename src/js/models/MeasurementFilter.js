import moment from 'moment-timezone'

class MeasurementFilterModel {
	constructor () {
		this._name = null
		this._devices = []
		this._deviceGroups = []
		this._fields = []
		this._from = null
		this._to = null
		this._interval = null
		this._sorting = []
		this._limit = null
	}

	setName (name) {
		this._name = name
		return this
	}
	getName () {
		return this._name || this.getDevices().join(', ')
	}
	setDevices (devices = []) {
		this._devices = []
		devices.forEach((udid) => {
			this.addDevice(udid)
		})
		return this
	}
	addDevice (udid) {
		if (typeof udid !== 'string' || ! udid.match(/^[a-z0-9]{16}$/)) {
			throw new Error(`Invalid device ID "${udid}".`)
		}

		this._devices.push(udid)
		return this
	}
	getDevices () {
		return this._devices
	}
	setDeviceGroups (groups = []) {
		this._deviceGroups = []
		groups.forEach((group) => {
			this.addDeviceGroup(group)
		})
		return this
	}
	addDeviceGroup (group) {
		if (typeof group !== 'string' || ! group.match(/^[a-zA-Z0-9]+$/)) {
			throw new Error(`Invalid device group ID "${group}".`)
		}

		this._deviceGroups.push(group)
		return this
	}
	getDeviceGroups () {
		return this._deviceGroups
	}
	setFields (fields = []) {
		this._fields = []
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

		this._fields.push({ name, aggregator })
		return this
	}
	getFields () {
		return this._fields
	}
	setFrom (date) {
		if ( ! (date instanceof moment) || ! date.isValid()) {
			throw new Error('Invalid from date.')
		}

		this._from = date
		return this
	}
	getFrom () {
		return this._from
	}
	setTo (date) {
		if ( ! (date instanceof moment) || ! date.isValid()) {
			throw new Error('Invalid to date.')
		}

		this._to = date
		return this
	}
	getTo () {
		return this._to
	}
	setInterval (interval) {
		if (typeof interval === 'number' && isNaN(interval)) {
			throw new Error('Invalid interval.')
		} else if (typeof interval === 'string' && ! interval) {
			throw new Error('Invalid interval.')
		}

		this._interval = interval
		return this
	}
	getInterval () {
		return this._interval
	}
	setSorting (sorting = []) {
		this._sorting = []
		sorting.forEach(({ name, order }) => {
			this.addSort(name, order)
		})
		return this
	}
	addSort (name, order = 1) {
		if (typeof name !== 'string' || ! name.match(/^[a-zA-Z0-9]+$/)) {
			throw new Error('Invalid sorting name.')
		}
		if (order !== 1 && order !== -1) {
			throw new Error('Invalid sorting order.')
		}

		this._sorting.push({ name, order })
		return this
	}
	getSorting () {
		return this._sorting
	}
	setLimit (limit) {
		if (typeof limit !== 'number' || isNaN(limit)) {
			throw new Error('Invalid limit.')
		}

		this._limit = limit
		return this
	}
	getLimit () {
		return this._limit
	}

	toJSON () {
		var from = this.getFrom()
		var to = this.getTo()

		return {
			name: this.getName(),
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
