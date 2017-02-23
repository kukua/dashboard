import config from '../config'
import { current as user } from '../models/User'
import { checkStatus, parseJSON } from '../lib/fetch'

export default {
	login (email, password) {
		return (dispatch) => {
			dispatch({ type: 'USER_LOGIN' })

			var auth = new Buffer(email + ':' + password)
				.toString('base64')

			return fetch(config.apiUrl + '/users/login?includes=config,groups.config', {
				headers: {
					'Authorization': 'Basic ' + auth,
					'Accept': 'application/json',
				},
			})
				.then(checkStatus)
				.then(parseJSON)
				.then((item) => {
					dispatch({ type: 'USER_LOGIN_SUCCESS', item })
					return item
				})
				.catch((err) => {
					user.clear()
					dispatch({ type: 'ERROR_ADD', err })
					dispatch({ type: 'USER_LOGIN_FAIL', err })
					return Promise.reject(err)
				})
		}
	},

	logout () {
		user.clear()
		window.location = '/' // Refresh
		return { type: 'USER_LOGOUT' }
	},
}
