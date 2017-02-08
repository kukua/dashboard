import _ from 'underscore'
import s from 'underscore.string'
import moment from 'moment-timezone'
import assign from 'es6-object-assign'
import cookie from 'js-cookie'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import reducers from './reducers/'
import Router from './components/router'
import { instance as user } from './lib/user'

import 'whatwg-fetch'
import '../css/main.css'

_.mixin(s.exports())
assign.polyfill()

moment.tz.setDefault('UTC')

user.set(JSON.parse(cookie.get('user') || '{}'))
user.onChange((data) => cookie.set('user', data, { expires: 7 }))

const store = createStore(reducers, applyMiddleware(thunk))

render(
	<Provider store={store}>{Router}</Provider>,
	document.getElementById('app')
)
