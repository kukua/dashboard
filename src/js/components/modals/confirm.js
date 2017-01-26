import React from 'react'
import Modal from 'react-modal'

Modal.defaultStyles = {
	overlay: {
		position        : 'fixed',
		top             : 0,
		left            : 0,
		right           : 0,
		bottom          : 0,
		backgroundColor : 'rgba(0, 0, 0, 0.75)'
	},
	content: {
		position                : 'absolute',
		top                     : '60px',
		left                    : '40px',
		right                   : '40px',
		bottom                  : '40px',
		border                  : 'none',
		background              : 'none',
		overflow                : 'auto',
		WebkitOverflowScrolling : 'touch',
		borderRadius            : '4px',
		outline                 : 'none',
		padding                 : '20px'
	}
}

export default class Confirm extends React.Component {
	render () {
		var closeLabel = (this.props.closeLabel || 'Close')
		var confirmLabel = (this.props.confirmLabel || 'Confirm')

		return (
			<Modal
				isOpen={this.props.isOpen}
				onRequestClose={this.props.onClose}>
				<div class="modal-content col-sm-offset-3 col-sm-6">
					<div class="modal-header">
						<button class="close" onClick={this.props.onClose}>
							<span aria-hidden="true">×</span>
							<span class="sr-only">{closeLabel}</span>
						</button>
						{this.props.title &&
							<h4 class="modal-title">{this.props.title}</h4>
						}
					</div>
					<div class="modal-body">
						{this.props.children}
					</div>
					<div class="modal-footer">
						<button class="btn btn-default pull-left" onClick={this.props.onClose}>{closeLabel}</button>
						<button class="btn btn-success pull-right" onClick={this.props.onSubmit}>{confirmLabel}</button>
					</div>
				</div>
			</Modal>
		)
	}
}

Confirm.propTypes = {
	isOpen: React.PropTypes.bool,
	title: React.PropTypes.string,
	onClose: React.PropTypes.func.isRequired,
	onSubmit: React.PropTypes.func.isRequired,
	closeLabel: React.PropTypes.string,
	confirmLabel: React.PropTypes.string,
	children: React.PropTypes.element,
}
