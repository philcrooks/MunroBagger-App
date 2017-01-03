const React = require('react');
import { Dialog, DialogTitle, DialogContent, DialogActions, Textfield, Button } from 'react-mdl';

const UserLogin = React.createClass({

  getInitialState: function() {
    return {
      openDialog: false,
      email: "",
      password: ""
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.willDisplay) {
      this.setState({openDialog: true, email: "", password: ""});
    }
  },

  shouldComponentUpdate: function(nextProps, nextState){
    return this.state.openDialog || nextState.openDialog;
  },

  updateEmail: function(event) {
    this.setState({email: event.target.value})
  },

  updatePassword: function(event) {
    this.setState({password: event.target.value})
  },

  clickLogin: function() {
    let busy = false;
    let request = this.props.user.login(
      this.state.email.toLowerCase(),
      this.state.password,
      function(success, returned){
        if (success) {
          // Credentials have been accepted
          // Try and read the bagged_munro data
          request = this.props.user.getInfo(true, function(success, returned) {
            if (busy) this.props.onBusy(false);
            if (success) {
              console.log("Logged In")
              this.setState({openDialog: false});
              this.props.onCompleted(true, null);
            }
            else {
              // Failed to login
              navigator.notification.alert(returned.message, null, "Login Failed", "OK");
            }
          }.bind(this));
          busy = busy || (request.state !== "sent");
          if (busy) this.props.onBusy(true);
        }
        else {
          // Failed to login
          navigator.notification.alert(returned.message, null, "Login Failed", "OK");
          this.setState({email: "", password: ""})
        }
      }.bind(this)
    )
    busy = (request.state !== "sent");
    if (busy) this.props.onBusy(true);
  },

  clickClose: function() {
    this.setState({openDialog: false});
    this.props.onCompleted(false, null);
  },

  clickRegister: function() {
    this.setState({openDialog: false});
    this.props.onCompleted(false, 'register');
  },

  clickResetPassword: function() {
    this.setState({openDialog: false});
    this.props.onCompleted(false: 'resetPassword');
  },

  render: function(){
    return (
      <Dialog open={this.state.openDialog}>
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          <Textfield
            required={true}
            onChange={this.updateEmail}
            label="Email..."
            style={{width: '200px'}}
            value={this.state.email}
          />
          <Textfield
            required={true}
            onChange={this.updatePassword}
            label="Password..."
            style={{width: '200px'}}
            type="password"
            value={this.state.password}
          />
          <p>Logging in allows you to share your bagged Munros between different devices. You must register first.</p>
        </DialogContent>
        <DialogActions>
          <Button type='button' onClick={this.clickClose}>Close</Button>
          <Button type='button' onClick={this.clickLogin}>Login</Button>
        </DialogActions>
      </Dialog>
    )
  }
})

module.exports = UserLogin;