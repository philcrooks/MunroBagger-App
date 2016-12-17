const React = require('react');
import { Snackbar } from 'react-mdl';

const MountainSnackbar = React.createClass({
  getInitialState: function() {
    return(
      {
        snackbarActive: this.props.willDisplay,
        hideForever: false
      }
    );
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return (nextProps.willDisplay && !this.state.hideForever);
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({snackbarActive: nextProps.willDisplay});
  },

  handleTimeoutSnackbar: function() {
    this.setState({ snackbarActive: false });
    this.props.onCompleted(null);
  },

  handleClickActionSnackbar: function() {
    this.setState({ snackbarActive: false, hideForever: true });
    this.props.onCompleted(null);
  },

  render: function() {
    console.log("Rendering Snackbar")

    return (
      <Snackbar
        active={this.state.snackbarActive}
        onClick={this.handleClickActionSnackbar}
        onTimeout={this.handleTimeoutSnackbar}
        action="Got it">
        Click <span className="infoIcon">i</span>for more information.
      </Snackbar>
    )
  }
});

module.exports = MountainSnackbar;