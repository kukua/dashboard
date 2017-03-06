import config from '../config'
import { current as user } from '../models/User'
import { checkStatus, parseJSON } from '../helpers/fetch'
import DeviceGroupModel from '../models/DeviceGroup'

export default {
	fetchAll () {
		return (dispatch) => {
			dispatch({ type: 'DEVICE_GROUP_FETCH_ALL' })

			return fetch(config.apiUrl + '/deviceGroups?includes=devices', {
				headers: {
					'X-Auth-Token': user.token,
					'Accept': 'application/json',
				},
			})
				.then(checkStatus)
				.then(parseJSON)
				.then((items) => items.map((item) => new DeviceGroupModel(item)))
				.then((items) => {
					dispatch({ type: 'DEVICE_GROUP_FETCH_ALL_SUCCESS', items })
					return items
				})
				.catch((err) => {
					dispatch({ type: 'ERROR_ADD', err })
					dispatch({ type: 'DEVICE_GROUP_FETCH_ALL_FAIL', err })
					return Promise.reject(err)
				})
		}
	},

	fetchByID (id) {
		return (dispatch) => {
			dispatch({ type: 'DEVICE_GROUP_FETCH' })

			return fetch(config.apiUrl + '/deviceGroups/' + id + '?includes=devices', {
				headers: {
					'X-Auth-Token': user.token,
					'Accept': 'application/json',
				},
			})
				.then(checkStatus)
				.then(parseJSON)
				.then((item) => new DeviceGroupModel(item))
				.then((item) => {
					dispatch({ type: 'DEVICE_GROUP_FETCH_SUCCESS', item })
					return item
				})
				.catch((err) => {
					dispatch({ type: 'ERROR_ADD', err })
					dispatch({ type: 'DEVICE_GROUP_FETCH_FAIL', err })
					return Promise.reject(err)
				})
		}

	},
}
