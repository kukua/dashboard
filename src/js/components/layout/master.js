import React from 'react'
import Header from '../header/header'
import Notifications from './notifications'

export default class LayoutMaster extends React.Component {
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

LayoutMaster.propTypes = {
	children: React.PropTypes.element,
	location: React.PropTypes.shape({
		pathname: React.PropTypes.string.isRequired,
	}).isRequired,
}
