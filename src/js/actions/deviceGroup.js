import config from '../config'
import { instance as user } from '../lib/user'
import { checkStatus, parseJSON } from '../lib/fetch'
import DeviceGroupModel from '../models/DeviceGroup'

export default {
	fetchByID (id) {
		if (typeof id !== 'string' || ! id.match(/^[a-zA-Z0-9]+$/)) {
			throw new Error('Invalid device group ID.')
		}

		return (/*dispatch*/) => {
			// Doesn't use Redux reducers
			return fetch(config.apiUrl + '/deviceGroups/' + id + '?includes=devices', {
				headers: {
					'X-Auth-Token': user.token,
					'Accept': 'application/json',
				},
			})
				.then(checkStatus)
				.then(parseJSON)
				.then((data) => new DeviceGroupModel(data))
		}
	},
}
