const React = require('react');
import { Dialog, DialogTitle, DialogContent, DialogActions, Textfield, Button } from 'react-mdl';
const ApiRequest = require('../../models/api_request')
const passwordOK = require('../../utility.js').passwordOK;

const UserRegistration = React.createClass({

  getInitialState: function() {
    return {
      openDialog: false,
      email: "",
      password: "",
      passwordConfirmation: "",
      mismatch: false
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.willDisplay) {
      this.setState({
        openDialog: true,
        email: "",
        password: "",
        passwordConfirmation: "",
        mismatch: false
      });
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
    // console.log(this.state.password)
  },

  updatePasswordConfirmation: function(event) {
    this.setState({passwordConfirmation: event.target.value})
    // console.log(this.state.passwordConfirmation)
  },

  clickRegister: function() {
    if (this.state.password === this.state.passwordConfirmation && passwordOK(this.state.password)) {
      this.props.user.register(this.state.email, this.state.password, function(success, returned) {
        if (success) {
          this.props.onCompleted(null)
        }
        else {
          if (returned.status === 422) this.setState({signupEmailExists: true});
        }
      }.bind(this))
    } else {
      this.setState({mismatch: true, email: "", password: "", passwordConfirmation: ""});
    } 
  },

  clickClose: function() {
    this.setState({openDialog: false});
    this.props.onCompleted(false, null);
  },


  render: function(){

    return (
      <Dialog open={this.state.openDialog}>
        <DialogTitle>Register</DialogTitle>
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
          <Textfield
            required={true}
            onChange={this.updatePasswordConfirmation}
            label="Repeat password..."
            style={{width: '200px'}}
            type="password"
            value={this.state.passwordConfirmation}
          />
          <p>Passwords must have at least one capital letter, one number and eight characters.</p>
        </DialogContent>
        <DialogActions>
          <Button type='button' onClick={this.clickClose}>Close</Button>
          <Button type='button' onClick={this.clickRegister}>Register</Button>
        </DialogActions>
      </Dialog>
    )

  }

})

module.exports = UserRegistration;