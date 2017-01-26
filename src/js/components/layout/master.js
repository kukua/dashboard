import React from 'react'
import Header from '../header/header'
import Notifications from './notifications'

export default class Master extends React.Component {
	render () {
		return (
			<div>
				<div class="container">
					<Header location={this.props.location} />
					{this.props.children}
					<Notifications />
				</div>
			</div>
		)
	}
}

Master.propTypes = {
	children: React.PropTypes.element,
	location: React.PropTypes.shape({
		pathname: React.PropTypes.string.isRequired,
	}).isRequired,
}
