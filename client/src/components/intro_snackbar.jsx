const React = require('react');
import { Snackbar } from 'react-mdl';
const logger = require('../utility').logger;

const IntroSnackbar = React.createClass({
  getInitialState: function() {
    return({ active: false });
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return (this.state.active || (this.state.active !== nextState.active));
  },

  componentWillReceiveProps: function(nextProps) {
    if (!this.state.active && nextProps.willDisplay) this.setState({active: true});
  },

  handleTimeoutSnackbar: function() {
    this.setState({ active: false });
    this.props.onCompleted();
  },

  handleClickActionSnackbar: function() {
    this.setState({ active: false });
    this.props.onCompleted();
  },

  render: function() {
    logger("Rendering Intro Snackbar")

    return (
      <Snackbar
        active={this.state.active}
        onClick={this.handleClickActionSnackbar}
        onTimeout={this.handleTimeoutSnackbar}
        timeout={7500}
        action="Got it">
        Tap a mountain then <span className="info-icon">i</span>to find out more.
      </Snackbar>
    )
  }
});

module.exports = IntroSnackbar;