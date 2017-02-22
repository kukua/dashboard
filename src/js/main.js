import _ from 'underscore'
import s from 'underscore.string'
import moment from 'moment-timezone'
import assign from 'es6-object-assign'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import user from './lib/user'
import reducers from './reducers/'
import Router from './components/router'

import 'whatwg-fetch'
import 'array.prototype.fill'
import '../css/main.css'

_.mixin(s.exports())
assign.polyfill()

moment.tz.setDefault('UTC')

user.load()

const store = createStore(reducers, applyMiddleware(thunk))

render(
	<Provider store={store}>{Router}</Provider>,
	document.getElementById('app')
)
