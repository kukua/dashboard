import React from 'react'
import Header from '../header/header'
import Notifications from './notifications'

class MasterLayout extends React.Component {
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

MasterLayout.propTypes = {
	children: React.PropTypes.element,
	location: React.PropTypes.shape({
		pathname: React.PropTypes.string.isRequired,
	}).isRequired,
}

export default MasterLayout
