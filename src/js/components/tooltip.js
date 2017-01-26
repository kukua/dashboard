import React from 'react'

class Tooltip extends React.Component {
	getPlacement () {
		return (this.props.placement === 'left' ? 'right' : 'left')
	}
	onUpdate () {
		$(this.refs.tooltip).tooltip('destroy')
		$(this.refs.tooltip).tooltip({
			placement: this.getPlacement(),
			title: this.props.title,
		})
	}

	componentDidMount () {
		this.onUpdate()
	}
	componentWillReceiveProps () {
		setTimeout(() => this.onUpdate(), 1)
	}

	render () {
		return (
			<i ref="tooltip" class={`text-${this.props.placement || 'right'} fa fa-question-circle`} aria-hidden="true"
				data-title={this.props.title} data-toggle="tooltip" data-placement={this.getPlacement()} />
		)
	}
}

Tooltip.propTypes = {
	placement: React.PropTypes.string,
	title: React.PropTypes.string.isRequired,
}

export default Tooltip
