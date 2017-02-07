const initial = {
	loading: false,
}

export default (state = initial, action) => {
	switch (action.type) {
	case 'DEVICE_GROUP_FETCH_ALL':
		return Object.assign({}, initial, {
			loading: true,
		})
	case 'DEVICE_GROUP_FETCH_ALL_FAIL':
		return Object.assign({}, initial, {
			loading: false,
			err: action.err,
		})
	case 'DEVICE_GROUP_FETCH_ALL_SUCCESS':
		return Object.assign({}, initial, {
			loading: false,
			items: action.items,
		})
	}

	return state
}
