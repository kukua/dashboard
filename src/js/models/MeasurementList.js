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
		var isGrouped = this.getRequestFilter().isGrouped()

		if (isGrouped && ! Array.isArray(values)) {
			throw new Error('Invalid values array.')
		} else if ( ! isGrouped && typeof values !== 'object') {
			throw new Error('Invalid values object.')
		}

		this._values = values
		return this
	}
	getValues () {
		return this._values
	}

	sortValues () {
		var isGrouped = this.getRequestFilter().isGrouped()
		var timestampIndex = this.getColumns().indexOf('timestamp')
		var values = this.getValues()

		if (isGrouped) {
			this.setValues(_.sortBy(values, (value) => value[timestampIndex]))
		} else {
			for (var id in values) {
				values[id] = _.sortBy(values[id], (value) => value[timestampIndex])
			}
			this.setValues(values)
		}

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
