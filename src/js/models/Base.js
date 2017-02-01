class BaseModel {
	constructor (attributes = {}) {
		this.setAttributes(attributes)
	}

	get id () { return this._attributes.id }

	setAttributes (data) {
		if (typeof data !== 'object') {
			throw new Error('Invalid attributes object.')
		}

		this._attributes = data
		return this
	}
	getAttributes () {
		return this._attributes
	}
	getAttribute (key) {
		return this.getAttributes()[key]
	}
}

export default BaseModel
