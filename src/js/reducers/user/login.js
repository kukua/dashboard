const initial = {
	loading: false,
}

export default (state = initial, action) => {
	switch (action.type) {
	case 'USER_LOGIN':
		return Object.assign({}, initial, {
			loading: true,
		})
	case 'USER_LOGIN_FAIL':
		return Object.assign({}, initial, {
			loading: false,
			err: action.err,
		})
	case 'USER_LOGIN_SUCCESS':
		return Object.assign({}, initial, {
			loading: false,
			item: action.item,
		})
	case 'USER_LOGOUT':
		return Object.assign({}, initial)
	}

	return state
}
