import _ from 'underscore'
import titleize from 'underscore.string/titleize'
import React from 'react'
import moment from 'moment-timezone'
import parseDuration from 'parse-duration'
import { Link } from 'react-router'
import BaseWidget from './Base'
import { current as user } from '../../models/User'
import actions from '../../actions/jobResult'

const columns = {
	temp: 'temperature',
	rain: 'rainfall',
	windSpeed: 'wind speed',
	gustSpeed: 'gust speed',
}

class AlertOverviewWidget extends BaseWidget {
	constructor () {
		super()
		this.state = {
			isLoading: false,
			results: null,
		}
	}

	loadData () {
		this.setState({
			isLoading: true,
			results: null,
		})

		actions.fetchByJobID(this.props.fetch.jobID, this.props.fetch.limit)
			.then((results) => this.setState({ isLoading: false, results }))
	}
	componentWillMount () {
		if (this.props.shared.deviceGroups) {
			this.loadData()
		}
	}
	componentWillReceiveProps (next) {
		if (next.shared.deviceGroups) {
			this.loadData()
		}
	}

	getDevices (includedOnly = true) {
		var deviceGroups = this.props.shared.deviceGroups
		if ( ! deviceGroups) return []
		return _.chain(deviceGroups)
			.map((group) => group.getDevices())
			.flatten()
			.filter((device) => ! includedOnly || device.getAttribute('include'))
			.uniq(false, (device) => device.id)
			.value()
	}

	renderError (err) {
		return (<div class="alert alert-danger">{err}</div>)
	}

	getAlerts () {
		var results = this.state.results || []

		if (results.length === 0) return []

		var activeEnd = this.props.active.dateRange.end
		if (activeEnd === 'now') activeEnd = moment.utc().endOf('day')
		else activeEnd = moment.utc(activeEnd)

		var activeStart = this.props.active.dateRange.start
		if (activeStart.startsWith('-')) {
			activeStart = activeEnd.clone().subtract(parseDuration(activeStart.substr(1)), 'milliseconds')
		} else activeStart = moment.utc(activeStart)

		var types = this.props.types
		var availableStyles = ['info', 'warning', 'danger']
		var devices = this.getDevices()

		return _.chain(results)
			.map((result) => {
				if (typeof result.data !== 'object' || typeof result.data.results !== 'object') {
					return []
				}

				var date = moment.utc(result.created_at)
				var active = date.isBetween(activeStart, activeEnd)

				return _.map(result.data.results, (values, deviceID) => _.map(values, (type, column) => {
					var style = (types[type] && types[type].style || 'hidden')
					var device = _.find(devices, (device) => device.id === deviceID) // If not found, device is excluded

					if (availableStyles.indexOf(style) === -1 || ! device) {
						style = 'hidden'
					}

					var message = this.createMessage(types[type], column, device)

					return { date, active, device, type, style, message }
				}))
			})
			.flatten()
			.compact()
			.filter((result) => result.style !== 'hidden')
			.first(100)
			.value()
	}
	createMessage (type, column, device) {
		var message = (type && type.messageFormat || 'Alert for :device (:device_group).')
		var deviceLabels = user.getConfig('deviceLabels') || {}
		var deviceGroups = this.props.shared.deviceGroups
		var deviceGroup = _.find(deviceGroups, (group) => _.find(group.getDevices(), (d) => d === device))
		var replacements = {
			column: (columns[column] || column),
			device_group: (deviceGroup && deviceGroup.name || ''),
			device: (deviceLabels[device.id] || device.name || device.id),
		}

		for (var key in replacements) {
			message = message.replace(':' + key, replacements[key])
		}

		return message
	}

	createLinkTo (alert) {
		var link = this.props.link
		var query = {}

		if (link.devicePickerWidgetParams) {
			query.allDevices = 0
			query.devices = alert.device.id
		}
		if (link.controlsWidgetParams) {
			query.startDate = alert.date.format('DD-MM-YYYY')
			query.endDate = alert.date.format('DD-MM-YYYY')
			query.interval = '1h'
		}

		return { pathname: link.to, query }
	}

	render () {
		if ( ! this.props.shared.deviceGroups || this.state.isLoading) {
			return (<div>Loading…</div>)
		}

		var alerts = this.getAlerts()
		var link = this.props.link

		// TODO(mauvm): Add thead, requires translation config for devices and device groups:
		// e.g. in case of IHS it's sites and regions respectively.

		return (
			<table class="table table-striped table-bordered">
				<thead>
					<tr>
						<th>Timestamp</th>
						<th>Type</th>
						<th>Alert</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
				{alerts.length > 0
					? alerts.map((alert, i) => (
						<tr key={i} class={alert.active ? alert.style : ''}>
							<td>{alert.date.format('HH:mm DD-MM-YYYY')}</td>
							<td>{titleize(alert.type)}</td>
							<td>{alert.message}</td>
							{link && (
								<td width="85px">
									<Link to={this.createLinkTo(alert)} class="btn btn-default btn-xs pull-right">{link.label}</Link>
								</td>
							)}
						</tr>
					))
					: <tr><td colSpan={4}>No alerts.</td></tr>
				}
				</tbody>
			</table>
		)
	}
}

AlertOverviewWidget.propTypes = Object.assign({}, BaseWidget.PropTypes, {
	shared: React.PropTypes.shape({
		deviceGroups: React.PropTypes.array,
	}).isRequired,
	fetch: React.PropTypes.shape({
		jobID: React.PropTypes.string.isRequired,
		limit: React.PropTypes.number.isRequired,
	}).isRequired,
	active: React.PropTypes.shape({
		dateRange: React.PropTypes.shape({
			start: React.PropTypes.string.isRequired,
			end: React.PropTypes.string.isRequired,
		}).isRequired,
	}).isRequired,
	types: React.PropTypes.object.isRequired,
	link: React.PropTypes.shape({
		label: React.PropTypes.string.isRequired,
		to: React.PropTypes.string.isRequired,
		devicePickerWidgetParams: React.PropTypes.bool,
		controlsWidgetParams: React.PropTypes.bool,
	}),
})

export default AlertOverviewWidget
