import { NotificationManager } from 'react-notifications'
import _ from 'underscore'

export default {
	error (message) {
		NotificationManager.error(message)
	},
	action (type, action) {
		var message = _.capitalize(type, true) + ' ' + action + '.'
		NotificationManager.success(message)
	},
	created (type) {
		this.action(type, 'created')
	},
	updated (type) {
		this.action(type, 'updated')
	},
	destroyed (type) {
		this.action(type, 'destroyed')
	},
}
