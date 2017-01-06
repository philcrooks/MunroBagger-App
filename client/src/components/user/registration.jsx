const React = require('react');
import { Dialog, DialogTitle, DialogContent, DialogActions, Textfield, Button, Spinner } from 'react-mdl';
const passwordOK = require('../../utility.js').passwordOK;
const emailOK = require('../../utility.js').emailOK;

const UserRegistration = React.createClass({

  getInitialState: function() {
    return {
      openDialog: false,
      email: "",
      password: "",
      passwordConfirmation: "",
      busy: false
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.willDisplay) {
      this.setState({
        openDialog: true,
        email: "",
        password: "",
        passwordConfirmation: ""
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
  },

  updatePasswordConfirmation: function(event) {
    this.setState({passwordConfirmation: event.target.value})
  },


  clickRegister: function() {
    const pwdOK = ((this.state.password === this.state.passwordConfirmation) && passwordOK(this.state.password));
    const emlOK = emailOK(this.state.email);
    if (pwdOK && emlOK) {
      this.setState({busy: true})
      this.props.user.register(this.state.email, this.state.password, function(success, returned) {
        if (success) {
          this.setState({busy: false, openDialog: false});
          navigator.notification.alert(
            "Please check your inbox for a confirmation email. You must complete the registration process within 24 hours.",
            null, "Registration Success", "OK");
          this.props.onCompleted(null);
        }
        else {
          navigator.notification.alert(returned.message, null, "Registration Failed", "OK");
          this.setState({busy: false, password: "", passwordConfirmation: ""});
        }
      }.bind(this))
    } else {
      let message;
      if (emlOK) {
        message = "Passwords must match and fulfill the strength requirements,";
        this.setState({password: "", passwordConfirmation: ""});
      }
      else {
        message = "You must enter a valid email address.";
      }
      navigator.notification.alert(message, null, "Registration Failed", "OK");
    } 
  },

  clickClose: function() {
    this.setState({openDialog: false});
    this.props.onCompleted(false, null);
  },

  render: function(){

    let spinner = (this.state.busy) ? <div className='spinner-container'><Spinner singleColor /></div> : null;

    return (
      <Dialog open={this.state.openDialog}>
        {spinner}
        <DialogTitle>Register</DialogTitle>
        <DialogContent>
          <Textfield
            required={true}
            onChange={this.updateEmail}
            label="Email..."
            style={{width: '220px'}}
            type="email"
            value={this.state.email}
          />
          <Textfield
            required={true}
            onChange={this.updatePassword}
            label="Password..."
            style={{width: '220px'}}
            type="password"
            value={this.state.password}
          />
          <Textfield
            required={true}
            onChange={this.updatePasswordConfirmation}
            label="Repeat password..."
            style={{width: '220px'}}
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