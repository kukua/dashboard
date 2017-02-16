import config from '../config'
import { instance as user } from '../lib/user'
import { checkStatus, parseJSON } from '../lib/fetch'

export default {
	// Doesn't use Redux reducers
	fetchByJobID (jobID, limit = 3) {
		return fetch(config.apiUrl + '/jobs/' + jobID + '/results?limit=' + limit, {
			headers: {
				'X-Auth-Token': user.token,
				'Accept': 'application/json',
			},
		})
			.then(checkStatus)
			.then(parseJSON)
	},
}
