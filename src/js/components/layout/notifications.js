import React from 'react'
import _ from 'underscore'
import { connect } from 'react-redux'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import { FetchError } from '../../helpers/fetch'
import userActions from '../../actions/user'

import 'react-notifications/lib/notifications.css'

const mapStateToProps = (state) => {
	return { errors: state.error }
}

const mapDispatchToProps = (/*dispatch*/) => {
	return {
	}
}

class NotificationsLayout extends React.Component {
	constructor (props) {
		super(props)
		this.state = {
			handled: []
		}
	}

	checkLogout (item) {
		if ( ! item.err.response || item.err.response.status !== 401) {
			return
		}

		if (this.context.location.pathname === 'users/login') {
			return
		}

		userActions.logout()
		this.context.router.replace('/users/login')
	}

	componentWillMount () {
		this.handle(this.props.errors)
	}
	componentWillReceiveProps (next) {
		this.handle(next.errors)
	}
	handle (errors) {
		if ( ! _.isArray(errors)) return

		var handled = this.state.handled

		_.each(errors, (item) => {
			if (_.indexOf(handled, item) !== -1) return
			handled.push(item)

			NotificationManager.error(this.formatMessage(item), 'Whoops!')

			this.checkLogout(item)
		})

		this.setState({ handled })
	}
	formatMessage (item) {
		var message = item.err.toString()

		if (item.err instanceof FetchError) message = item.err.message

		if ( ! message) message = 'An unknown error occured.'

		return message
	}

	render () {
		return (<NotificationContainer/>)
	}
}

NotificationsLayout.propTypes = {
	errors: React.PropTypes.array
}
NotificationsLayout.contextTypes = {
	router: React.PropTypes.object.isRequired,
	location: React.PropTypes.object.isRequired,
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(NotificationsLayout)
