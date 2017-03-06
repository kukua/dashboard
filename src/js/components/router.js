import React from 'react'
import { Router, useRouterHistory, Route, IndexRedirect } from 'react-router'
import createBrowserHistory from 'history/lib/createBrowserHistory'
import { current as user } from '../models/User'
import notify from '../helpers/notify'

import Layout from './layout/master'
import NoMatch from './noMatch'

import UserLogin from '../components/user/login'
import DashboardIndex from '../components/dashboard/index'
import DashboardShow from '../components/dashboard/show'

const history = useRouterHistory(createBrowserHistory)({
	basename: '/',
})

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
	<Router history={history}>
		<Route path="/" component={Layout}>
			<IndexRedirect to="/dashboards/default" />

			<Route path="/dashboards" component={DashboardIndex} onEnter={requireAuthentication} />
			<Route path="/dashboards/:id" component={DashboardShow} onEnter={requireAuthentication} />

			<Route path="users/login" component={UserLogin} onEnter={isAuthenticated} />

			<Route path="*" component={NoMatch} />
		</Route>
	</Router>
)
