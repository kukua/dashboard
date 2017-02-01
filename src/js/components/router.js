import React from 'react'
import { Router, hashHistory, Route, IndexRedirect } from 'react-router'
import { instance as user } from '../lib/user'
import notify from '../lib/notify'

import Layout from './layout/master'
import NoMatch from './noMatch'

import UserLogin from '../components/user/login'
import DashboardIndex from '../components/dashboard/index'
import DashboardShow from '../components/dashboard/show'

function requireAuthentication (nextState, replace) {
	if ( ! user.isLoggedIn) return replace('/users/login')
	if ( ! user.isActive) {
		notify.error('Account not activated.')
		return replace('/users/login')
	}
}

function isAuthenticated (nextState, replace) {
	if (user.isLoggedIn && user.isActive) return replace('/')
}

export default (
	<Router history={hashHistory}>
		<Route path="/" component={Layout}>
			<IndexRedirect to="/dashboards" />

			<Route path="/dashboards" component={DashboardIndex} onEnter={requireAuthentication} />
			<Route path="/dashboards/:id" component={DashboardShow} onEnter={requireAuthentication} />

			<Route path="users/login" component={UserLogin} onEnter={isAuthenticated} />

			<Route path="*" component={NoMatch} />
		</Route>
	</Router>
)
