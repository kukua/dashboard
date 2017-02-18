import _ from 'underscore'
import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { current as user } from '../../models/User'
import userActions from '../../actions/user'

const mapStateToProps = (state) => {
	var user = state.user.login.item
	return { user }
}

const mapDispatchToProps = (/*dispatch*/) => {
	return {
	}
}

class HeaderMenu extends React.Component {
	componentWillMount () {
		user.onChange(() => {
			this.forceUpdate()
		})
	}

	onLogout () {
		userActions.logout()
		this.context.router.replace('/users/login')
	}

	getTitle () {
		return (user.isLoggedIn && user.getConfig('dashboard.title') || 'Kukua Dashboard')
	}
	getMenu () {
		var isActive = (to) => _.startsWith(this.props.location.pathname, to, 1)

		if (user.isLoggedIn) {
			return (
				<div class="navbar-collapse collapse" id="navbar-main">
					<ul class="nav navbar-nav">
						<li class={isActive('dashboards') ? 'active' : ''}><Link to="/dashboards">Dashboards</Link></li>
					</ul>
					<ul class="nav navbar-nav pull-right">
						<li class="dropdown">
							<a href="javascript:;" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">{user.name} <span class="caret"></span></a>
							<ul class="dropdown-menu">
								<li><a href="javascript:;" onClick={this.onLogout.bind(this)}>Sign out</a></li>
							</ul>
						</li>
					</ul>
				</div>
			)
		} else {
			return (
				<div class="navbar-collapse collapse" id="navbar-main">
					<ul class="nav navbar-nav pull-right">
						<li class={isActive('users/login') ? 'active' : ''}><Link to="/users/login">Login</Link></li>
					</ul>
				</div>
			)
		}
	}

	render () {
		return (
			<div class="navbar navbar-default navbar-fixed-top">
				<div class="container">
					<div class="navbar-header">
						<Link to="/" class="navbar-brand">{this.getTitle()}</Link>
						<button class="navbar-toggle" type="button" data-toggle="collapse" data-target="#navbar-main">
							<span class="icon-bar"></span>
							<span class="icon-bar"></span>
							<span class="icon-bar"></span>
						</button>
					</div>
					{this.getMenu()}
				</div>
			</div>
		)
	}
}

HeaderMenu.propTypes = {
	location: React.PropTypes.shape({
		pathname: React.PropTypes.string.isRequired,
	}).isRequired,
}
HeaderMenu.contextTypes = {
	router: React.PropTypes.object.isRequired
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(HeaderMenu)
