import _ from 'underscore'
import MeasurementFilterModel from './MeasurementFilter'

class MeasurementListModel {
	constructor () {
		this._requestFilter = null
		this._filter = null
		this._columns = []
		this._values = []
	}

	setRequestFilter (filter) {
		if ( ! (filter instanceof MeasurementFilterModel)) {
			throw new Error('Invalid measurement filter model.')
		}

		this._requestFilter = filter
		return this
	}
	getRequestFilter () {
		return this._requestFilter
	}
	setFilter (filter) {
		if (typeof filter !== 'object') {
			throw new Error('Invalid measurement filter object.')
		}

		this._filter = filter
		return this
	}
	getFilter () {
		return this._filter
	}
	setColumns (columns) {
		if ( ! Array.isArray(columns)) {
			throw new Error('Invalid columns array.')
		}

		this._columns = columns
		return this
	}
	getColumns () {
		return this._columns
	}
	setValues (values) {
		if ( ! Array.isArray(values)) {
			throw new Error('Invalid values array.')
		}

		this._values = values
		return this
	}
	getValues () {
		return this._values
	}
	sortValues () {
		var timestampIndex = this.getColumns().indexOf('timestamp')
		this.setValues(_.sortBy(this.getValues(), (value) => value[timestampIndex]))
		return this
	}
}

MeasurementListModel.create = (data, filter) => {
	var list = new MeasurementListModel()

	list.setRequestFilter(filter)
	list.setFilter(data.filter)
	list.setColumns(data.columns)
	list.setValues(data.values)

	return list
}

export default MeasurementListModel
