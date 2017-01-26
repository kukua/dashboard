import moment from 'moment-timezone'

const defaultFormat = 'YYYY-MM-DD HH:mm:ss'
const timezone = 'Europe/Amsterdam'

//moment.defaultFormat = defaultFormat
//moment.tz.setDefault(timezone)

export default {
	format (datetime) {
		return moment.utc(datetime).tz(timezone).format(defaultFormat)
	}
}
