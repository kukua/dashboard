import _ from 'underscore'
import FileSaver from 'file-saver'

export default (columns, lines, filename = 'data.tsv') => {
	try {
		var isFileSaverSupported = !! (new Blob)
	} catch (e) { /* noop */ }

	if ( ! isFileSaverSupported) return false

	var blob = new Blob(
		[columns.join('\t') + '\n' + _.map(lines, (line) => line.join('\t')).join('\n')],
		{ type: 'text/tsv;charset=utf-8;' }
	)
	FileSaver.saveAs(blob, filename)

	return true
}
