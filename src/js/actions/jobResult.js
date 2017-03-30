import config from '../config'
import { current as user } from '../models/User'
import { checkStatus, parseJSON } from '../helpers/fetch'
import parseDateRange from '../helpers/parseDateRange'

export default {
	// Doesn't use Redux reducers
	fetchByJobID (jobID, dateRange) {
		var [start, end] = parseDateRange(dateRange)
		var url = config.apiUrl + '/jobs/' + jobID + '/results' +
			'?from=' + start.toISOString() + '&to=' + end.toISOString()

		return fetch(url, {
			headers: {
				'X-Auth-Token': user.token,
				'Accept': 'application/json',
			},
		})
			.then(checkStatus)
			.then(parseJSON)
	},
}
