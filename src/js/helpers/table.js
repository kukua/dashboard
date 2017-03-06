import React from 'react'
import _ from 'underscore'
import { Table as DataTable, resolve } from 'reactabular'
import date from './date'

export class Table extends React.Component {
	getColumnSchema () {
		return _.map(this.props.columns, (column) => {
			var cell = {}

			if (column.key) {
				cell.property = column.key
			}
			if (column.cellProps) {
				cell.props = column.cellProps
			}
			if (column.isDate) {
				cell.format = (val) => date.format(val)
			}
			if (_.isFunction(column.value)) {
				cell.format = column.value // function (val, { columnIndex, column, rowData, rowIndex }) {}
			}

			return {
				header: {
					label: column.label,
				},
				cell,
			}
		})
	}
	resolveRows (columns) {
		// Allow nested keys like 'template.name'
		return resolve.resolve({ columns, method: resolve.nested })(this.props.rows)
	}

	onRow (row, rowIndex) {
		return {
			className: 'click-to-edit',
			title: 'Edit',
			onClick: () => this.props.onRowClick && this.props.onRowClick(row, rowIndex),
		}
	}

	render () {
		var columns = this.getColumnSchema()
		var rows = this.resolveRows(columns)

		return (
			<DataTable.Provider
				class="table table-striped table-hover"
				columns={columns}>
				<DataTable.Header />
				{   this.props.loading && (
					<tfoot><tr class="active"><td colSpan={columns.length}>Loading…</td></tr></tfoot>
				)}
				{ ! this.props.loading && rows.length > 0 && (
					<DataTable.Body rows={rows} rowKey="id" onRow={this.onRow.bind(this)} />
				)}
				{ ! this.props.loading && rows.length === 0 && (
					<tfoot><tr class="active"><td colSpan={columns.length}>No items…</td></tr></tfoot>
				)}
			</DataTable.Provider>
		)
	}
}

Table.propTypes = {
	columns: React.PropTypes.object.isRequired,
	rows: React.PropTypes.array.isRequired,
	loading: React.PropTypes.bool,
	onRowClick: React.PropTypes.func,
}
