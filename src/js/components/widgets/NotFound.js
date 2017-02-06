import React from 'react'
import BaseWidget from './Base'

class NotFoundWidget extends BaseWidget {
	render () {
		return (
			<div class="alert alert-danger">
				No "{this.props.type}" widget!
			</div>
		)
	}
}

export default NotFoundWidget
