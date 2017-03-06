import _ from 'underscore'

export default (columns, lines, filename = 'data.tsv') => {
	var data = columns.join('\t') + '\n' + _.map(lines, (line) => line.join('\t')).join('\n')
	var blob = new Blob([data], { type: 'text/tsv;charset=utf-8;' } )

	var elem = window.document.createElement('a')
	elem.href = window.URL.createObjectURL(blob)
	elem.download = filename
	document.body.appendChild(elem)
	elem.click()
	document.body.removeChild(elem)
}
