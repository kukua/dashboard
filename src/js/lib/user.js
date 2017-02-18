import _ from 'underscore'
import cookie from 'js-cookie'
import { current as user } from '../models/User'

const authKeys = ['email', 'auth_token']

export default {
	load () {
		var data = JSON.parse(localStorage.getItem('user') || '{}')
		var auth = JSON.parse(cookie.get('user') || '{}')
		user.setAttributes(Object.assign(data, auth))
		user.onChange((data) => {
			cookie.set('user', _.pick(data, authKeys), { expires: 7 })
			localStorage.setItem('user', JSON.stringify(_.omit(data, authKeys)))
		})
	},
}
