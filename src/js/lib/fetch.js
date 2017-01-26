import _ from 'underscore'

export function checkStatus (res) {
	if (res.status >= 200 && res.status < 300) return res

	return res.json().then((data) => { throw new FetchError(res, data) })
}

export function parseJSON (res) { return res.json() }

export class FetchError extends Error {
	constructor (res, data) {
		var message = data.message
		if ( ! message && _.isObject(data.messages)) {
			message = _.map(data.messages, (message) => message[0]).join('\n')
		}
		if ( ! message) message = res.statusText

		super(message)

		this.response = res
		this.data = data
	}
}
