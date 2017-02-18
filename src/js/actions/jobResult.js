import config from '../config'
import { current as user } from '../models/User'
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
