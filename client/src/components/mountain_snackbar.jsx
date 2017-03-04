const React = require('react');
import { Snackbar } from 'react-mdl';
const logger = require('../utility').logger;

const MountainSnackbar = React.createClass({
  getInitialState: function() {
    return(
      {
        active: false,
        hideForever: false
      }
    );
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return (this.state.active || (this.state.active !== nextState.active));
  },

  componentWillReceiveProps: function(nextProps) {
    if (!this.state.active && !this.state.hideForever && nextProps.willDisplay) this.setState({active: true});
  },

  handleTimeoutSnackbar: function() {
    logger("Snackbar timeout")
    this.setState({ active: false });
    this.props.onCompleted();
  },

  handleClickActionSnackbar: function() {
    this.setState({ active: false, hideForever: true });
    this.props.onCompleted();
  },

  render: function() {
    logger("Rendering Snackbar")

    return (
      <Snackbar
        active={this.state.active}
        onClick={this.handleClickActionSnackbar}
        onTimeout={this.handleTimeoutSnackbar}
        action="Got it">
        Tap <span className="info-icon">i</span>for more information.
      </Snackbar>
    )
  }
});

module.exports = MountainSnackbar;