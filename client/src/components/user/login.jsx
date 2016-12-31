const React = require('react');
import { Dialog, DialogTitle, DialogContent, DialogActions, Textfield, Button } from 'react-mdl';

const UserLogin = React.createClass({

  getInitialState: function() {
    return {
      openDialog: false,
      email: "",
      password: "",
      loginFailed: false
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.willDisplay) {
      this.setState({openDialog: true, email: "", password: "", loginFailed: false});
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
    this.props.user.login(
      this.state.email.toLowerCase(),
      this.state.password,
      function(success, returned){
        if (success) {
          console.log("Logged In")
          this.setState({openDialog: false});
          this.props.onCompleted(true, null);
        }
        else {
          console.log("Failed to log in")
          this.setState({email: "", password: "", loginFailed: true})
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

    var message;
    if (this.state.loginFailed) {
      message = (
        <p>Failed to log in. <span className="user-link" onClick={this.clickPasswordReset}>Reset password?</span></p>
      );
    }
    else {
      message = (
        <p>Do you need to <span className="user-link" onClick={this.clickRegister}>register?</span></p>
      )
    }

    return (
      <Dialog open={this.state.openDialog}>
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          <Textfield
            required={true}
            onChange={this.updateEmail}
            label="Email..."
            style={{width: '230px'}}
            value={this.state.email}
          />
          <Textfield
            required={true}
            onChange={this.updatePassword}
            label="Password..."
            style={{width: '230px'}}
            type="password"
            value={this.state.password}
          />
        </DialogContent>
        <DialogActions>
          <Button type='button' onClick={this.clickClose}>Close</Button>
          <Button type='button' onClick={this.clickLogin}>Login</Button>
          {message}
        </DialogActions>
      </Dialog>
    )
  }
})

module.exports = UserLogin;