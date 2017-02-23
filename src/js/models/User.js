import dot from 'dot-object'
import BaseModel from './Base'

class UserModel extends BaseModel {
	constructor (attributes) {
		super(attributes)
		this._callbacks = []
	}
	setAttributes (data) {
		super.setAttributes(data)
		this._change()
		return this
	}
	setAttribute (key, value) {
		super.setAttribute(key, value)
		this._change()
		return this
	}

	get name () { return this.getAttribute('name') }
	get token () { return this.getAttribute('auth_token') }
	get isLoggedIn () { return !! this.token }
	get isActive () { return !! this.getAttribute('is_active') }
	get isAdmin () { return !! this.getAttribute('is_admin') }

	getConfig (key) {
		if (typeof key !== 'string') {
			throw new Error('Invalid user config key.')
		}
		key = (key.indexOf('.') >= 0 ? key.replace('.', '.value.') : key + '.value')
		var config = (this.getAttribute('config') || {})
		var result = dot.pick(key, config)
		if (result !== undefined) return result
		var groups = this.getAttribute('groups') || []
		for (var group of groups) {
			result = dot.pick(key, group.config)
			if (result !== undefined) return result
		}
	}

	clear () {
		this.setAttributes({})
	}
	onChange (cb) {
		this._callbacks.push(cb)
	}
	getCallbacks () {
		return this._callbacks || []
	}
	_change () {
		this.getCallbacks().forEach((cb) => {
			cb(this._attributes)
		})
	}
}

export let current = new UserModel()
export default UserModel
