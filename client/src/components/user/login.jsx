const React = require('react');
import { Dialog, DialogTitle, DialogContent, DialogActions, Textfield, Button, Spinner } from 'react-mdl';
const logger = require('../../utility').logger;

const UserLogin = React.createClass({

  getInitialState: function() {
    return {
      openDialog: false,
      email: "",
      password: "",
      busy: false
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
    this.setState({busy: true})
    let request = this.props.user.login(
      this.state.email.toLowerCase(),
      this.state.password,
      function(success, returned){
        if (success) {
          // Credentials have been accepted
          // Try and read the bagged_munro data
          request = this.props.user.getInfo(true, function(success, returned) {
            if (success) {
              logger("Logged In")
              this.setState({openDialog: false, busy: false});
              this.props.onCompleted(true, null);
            }
            else {
              // Failed to login
              this.setState({busy: false})
              navigator.notification.alert(returned.message, null, "Login Failed", "OK");
            }
          }.bind(this));
        }
        else {
          // Failed to login
          navigator.notification.alert(returned.message, null, "Login Failed", "OK");
          this.setState({email: "", password: "", busy: false});
        }
      }.bind(this)
    )
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

    let spinner = (this.state.busy) ? <div className='spinner-container'><Spinner singleColor /></div> : null;

    return (
      <Dialog open={this.state.openDialog}>
        {spinner}
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          <Textfield
            required={true}
            onChange={this.updateEmail}
            label="Email..."
            style={{width: '200px'}}
            type="email"
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