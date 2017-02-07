import { combineReducers } from 'redux'
import error from './error'
import user from './user/'
import deviceGroup from './deviceGroup/'

export default combineReducers({
	error,
	user,
	deviceGroup,
})
