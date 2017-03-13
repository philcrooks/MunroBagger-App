const React = require('react');
import { Snackbar } from 'react-mdl';
const logger = require('../utility').logger;
const hideIntroKey = "hide_intro";

const IntroSnackbar = React.createClass({
  getInitialState: function() {
    const hideForever = (localStorage.getItem(hideIntroKey) === true.toString());
    logger("IntroSnackbar is", (hideForever) ? "hidden" : "not hidden")
    return({ active: false,  hideForever: hideForever});
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return (this.state.active || (this.state.active !== nextState.active));
  },

  componentWillReceiveProps: function(nextProps) {
    if (!this.state.active && !this.state.hideForever && nextProps.willDisplay) this.setState({active: true});
  },

  handleTimeoutSnackbar: function() {
    logger("Intro Snackbar timeout")
    this.setState({ active: false });
    this.props.onCompleted();
  },

  handleClickActionSnackbar: function() {
    this.setState({ active: false, hideForever: true });
    localStorage.setItem(hideIntroKey, true.toString());
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
        Tap a mountain then <span className="info-icon">i</span>for info.
      </Snackbar>
    )
  }
});

module.exports = IntroSnackbar;