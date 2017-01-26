import React from 'react'
import { hashHistory } from 'react-router'

export default class Title extends React.Component {
	render () {
		var backButton = (this.props.backButton !== false)
		var backButtonLabel = (this.props.backButtonLabel || 'Go back')
		var controlsClass = (this.props.controlsClass !== undefined ? this.props.controlsClass : 'pull-right')

		return (
			<div className="title-container">
				<h3>
					{this.props.title}
					{this.props.subTitle && (<small> - {this.props.subTitle}</small>)}
					<div class={controlsClass}>
						{backButton && backButtonLabel && ! this.props.loading &&
							<a href="javascript:;" class="btn btn-sm btn-default icon-left-open-mini" onClick={hashHistory.goBack}>
								{backButtonLabel}
							</a>
						}
						{this.props.children}
					</div>
					<div class="clearfix" />
				</h3>
				<hr />
			</div>
		)
	}
}

Title.propTypes = {
	title: React.PropTypes.string.isRequired,
	subTitle: React.PropTypes.string,
	backButton: React.PropTypes.bool,
	backButtonLabel: React.PropTypes.string,
	loading: React.PropTypes.bool,
	children: React.PropTypes.oneOfType([
		React.PropTypes.arrayOf(React.PropTypes.node),
		React.PropTypes.node
	]),
	controlsClass: React.PropTypes.string,
}
