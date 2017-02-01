import BaseModel from './Base'
import DeviceModel from './Device'

class DeviceGroupModel extends BaseModel {
	constructor (attributes = {}) {
		super(attributes)

		this.setDevices(attributes.devices || [])
		delete this._attributes.devices
	}

	get name () { return this._attributes.name }

	setDevices (devices) {
		this._devices = devices.map((device) => {
			if (device instanceof DeviceModel) {
				return device
			}
			if (typeof device !== 'object') {
				throw new Error('Invalid device object.')
			}
			return new DeviceModel(device)
		})
		return this
	}
	getDevices () {
		return this._devices
	}
}

export default DeviceGroupModel
