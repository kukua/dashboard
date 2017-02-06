import React from 'react'

class BaseWidget extends React.Component {
}

BaseWidget.propTypes = {
	columns: React.PropTypes.number.isRequired,
	shared: React.PropTypes.object.isRequired,
	onSetShared: React.PropTypes.func.isRequired,
}

module.exports = BaseWidget
