import BaseModel from './Base'

class DeviceModel extends BaseModel {
	get name () { return this._attributes.name }
}

export default DeviceModel
