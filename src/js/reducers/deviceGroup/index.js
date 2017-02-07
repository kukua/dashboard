import { combineReducers } from 'redux'
import fetchAll from './fetchAll'
import fetch from './fetch'

export default combineReducers({
	fetchAll,
	fetch,
})
