const React = require('react');
import { Dialog, DialogTitle, DialogContent, DialogActions, Textfield, Button, Spinner } from 'react-mdl';
const emailOK = require('../../utility.js').emailOK;

const ResetPassword = React.createClass({

  getInitialState: function() {
    return {
      openDialog: false,
      email: "",
      busy: false
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.willDisplay) {
      this.setState({
        openDialog: true,
        email: ""
      });
    }
  },

  shouldComponentUpdate: function(nextProps, nextState){
    return this.state.openDialog || nextState.openDialog;
  },

  updateEmail: function(event) {
    this.setState({email: event.target.value})
  },

  clickReset: function(event){
    if (emailOK(this.state.email)) {
      this.setState({busy: true})
      this.props.user.resetPassword(this.state.email, function(success, returned){
        if (success) {
          navigator.notification.alert(
            "Please check your inbox for an email containing your temporary password.",
            null, "Password Reset Successful", "OK");
          this.setState({busy: false, openDialog: false});
          this.props.onCompleted(null);
        }
        else {
          this.setState({busy: false});
          navigator.notification.alert(returned.message, null, "Password Reset Failed", "OK");
        }
      }.bind(this))
    }
    else {
      navigator.notification.alert("That is not a valid email address.", null, "Password Reset Failed", "OK");
    }
  },

  clickClose: function() {
    this.setState({openDialog: false});
    this.props.onCompleted(null);
  },

  render: function(){

    let spinner = (this.state.busy) ? <div className='spinner-container'><Spinner singleColor /></div> : null;

    return (
      <Dialog open={this.state.openDialog}>
        {spinner}
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Textfield
            required={true}
            onChange={this.updateEmail}
            label="Email..."
            style={{width: '200px'}}
            type="email"
            value={this.state.email}
          />
          <p>If you have forgotton your password, enter your email address then click the <b>Reset</b> button and you will receive a temporary password.</p>
        </DialogContent>
        <DialogActions>
          <Button type='button' onClick={this.clickClose}>Close</Button>
          <Button type='button' onClick={this.clickReset}>Reset</Button>
        </DialogActions>
      </Dialog>
    )
  }
})

module.exports = ResetPassword;
