import _ from 'underscore'
import MeasurementFilter from './MeasurementFilter'

class MeasurementListModel {
	constructor () {
		this._filter = null
		this._columns = []
		this._values = []
	}

	setFilter (filter) {
		if ( ! (filter instanceof MeasurementFilter)) {
			throw new Error('Invalid measurement filter model.')
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

MeasurementListModel.createWithData = (data) => {
	var list = new MeasurementListModel()
	var filter = MeasurementFilter.createWithData(data.filter)

	list.setFilter(filter)
	list.setColumns(data.columns)
	list.setValues(data.values)

	return list
}

export default MeasurementListModel
