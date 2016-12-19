const React = require('react');
import { Snackbar } from 'react-mdl';

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
    console.log("Snackbar timeout")
    this.setState({ active: false });
    this.props.onCompleted();
  },

  handleClickActionSnackbar: function() {
    this.setState({ active: false, hideForever: true });
    this.props.onCompleted();
  },

  render: function() {
    console.log("Rendering Snackbar")

    return (
      <Snackbar
        active={this.state.active}
        onClick={this.handleClickActionSnackbar}
        onTimeout={this.handleTimeoutSnackbar}
        action="Got it">
        Click <span className="info-icon">i</span>for more information.
      </Snackbar>
    )
  }
});

module.exports = MountainSnackbar;