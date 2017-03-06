import _ from 'underscore'
import config from '../config'
import { current as user } from '../models/User'
import { checkStatus, parseJSON } from '../helpers/fetch'
import MeasurementFilterModel from '../models/MeasurementFilter'
import MeasurementListModel from '../models/MeasurementList'

function toParameters (filter) {
	if ( ! (filter instanceof MeasurementFilterModel)) {
		throw new Error('Invalid measurement filter model.')
	}

	var parts = []

	var devices = filter.getDevices()
	if (devices.length > 0) {
		parts.push('devices=' + devices.join(','))
	}

	var deviceGroups = filter.getDeviceGroups()
	if (deviceGroups.length > 0) {
		parts.push('deviceGroups=' + deviceGroups.join(','))
	}

	if (devices.length === 0 && deviceGroups.length === 0) {
		throw new Error('No devices or device groups specified in measurement filter.')
	}

	var fields = filter.getFields()
	if (fields.length > 0) {
		parts.push('fields=' + _.map(fields, ({ name, aggregator }) => `${name}:${aggregator}`).join(','))
	} else {
		throw new Error('No fields specified in measurement filter.')
	}

	var from = filter.getFrom()
	if (from) {
		parts.push('from=' + from.toISOString())
	}

	var to = filter.getTo()
	if (to) {
		parts.push('to=' + to.toISOString())
	}

	var interval = filter.getInterval()
	if (interval) {
		parts.push('interval=' + interval)
	}

	var sorting = filter.getSorting()
	if (sorting) {
		parts.push('sort=' + _.map(sorting, ({ name, order }) => `${order < 0 ? '-' : ''}${name}`))
	}

	var limit = filter.getLimit()
	if (limit) {
		parts.push('limit=' + limit)
	}

	parts.push('grouped=0')

	return parts.join('&')
}

export default {
	// Doesn't use Redux reducers
	fetchByFilter (filter) {
		return fetch(config.apiUrl + '/measurements?' + toParameters(filter), {
			headers: {
				'X-Auth-Token': user.token,
				'Accept': 'application/json',
			},
		})
			.then(checkStatus)
			.then(parseJSON)
			.then((data) => MeasurementListModel.create(data, filter))
			.then((list) => list.sortValues())
	},
}
