import React from 'react'
import Menu from './menu'

export default class Header extends React.Component {
	render () {
		return  (
			<div>
				<Menu location={this.props.location} />
			</div>
		)
	}
}

Header.propTypes = {
	location: React.PropTypes.shape({
		pathname: React.PropTypes.string.isRequired,
	}).isRequired,
}
