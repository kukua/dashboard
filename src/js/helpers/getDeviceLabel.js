import _ from 'underscore'
import { current as user } from '../models/User'
import DeviceModel from '../models/Device'

var cache = {}

export default (deviceOrID, devices = []) => {
	if ( ! cache[deviceOrID]) {
		var device = (deviceOrID instanceof DeviceModel
			? deviceOrID
			: _.find(devices, (device) => device.id === deviceOrID)
		)
		var deviceLabels = (user.getConfig('deviceLabels') || {})
		var deviceID = deviceOrID
		var deviceName = ''

		if (device) {
			deviceID = device.id
			deviceName = device.name
		}

		cache[deviceOrID] = (deviceLabels[deviceID] || deviceName || deviceID)
	}

	return cache[deviceOrID]
}
