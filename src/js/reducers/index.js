import { combineReducers } from 'redux'
import error from './error'
import user from './user/'

export default combineReducers({
	error,
	user,
})
