import React from 'react'
import _ from 'underscore'
import { connect } from 'react-redux'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import { FetchError } from '../../lib/fetch'
import userActions from '../../actions/user'

const mapStateToProps = (state) => {
	return { errors: state.error }
}

const mapDispatchToProps = (/*dispatch*/) => {
	return {
	}
}

class Notifications extends React.Component {
	constructor (props) {
		super(props)
		this.state = {
			handled: []
		}
	}

	onLogout () {
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

			if (item.err.response && item.err.response.status === 401) {
				this.onLogout()
			}
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

Notifications.propTypes = {
	errors: React.PropTypes.array
}
Notifications.contextTypes = {
	router: React.PropTypes.object.isRequired
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Notifications)
