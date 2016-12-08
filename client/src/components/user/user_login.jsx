const React = require('react');
import { Dialog, DialogTitle, DialogContent, DialogActions, Textfield, Button } from 'react-mdl';

const ApiRequest = require('../../models/api_request')

const UserLogin = React.createClass({

  getInitialState: function() {
    return {
      openDialog: this.props.willDisplay,
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

  requestLogin: function() {
    this.props.user.login(this.state.email, this.state.password, function(success){
      if (success) {
        this.setState({openDialog: false});
        this.props.onCompleted(true, null);
      }
      else {
        this.setState({email: "", password: "", loginFailed: true})
      }
    }.bind(this))
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

    let errorStyle = (this.state.loginFailed) ? "block" : "none";

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
          <p style={{display: errorStyle}}>
            Those details don't match our records, please try again.
          </p>
        </DialogContent>
        <DialogActions fullWidth>
          <Button type='button' onClick={this.requestLogin}>Login</Button>
          <Button type='button' onClick={this.clickRegister}>Register</Button>
          <p className="user-link" onClick={this.clickPasswordReset}>Forgot your password?</p>
        </DialogActions>
      </Dialog>
    )
  }
})


module.exports = UserLogin;