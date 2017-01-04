var React = require('react');
import { Dialog, DialogTitle, DialogContent, DialogActions, Textfield, Button, Spinner } from 'react-mdl';
const passwordOK = require('../../utility.js').passwordOK;

const ChangePassword = React.createClass ({

  getInitialState: function() {
    return {
      openDialog: false,
      password: "",
      passwordConfirmation: "",
      busy: false
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.willDisplay) {
      this.setState({
        openDialog: true,
        password: "",
        passwordConfirmation: ""
      });
    }
  },

  shouldComponentUpdate: function(nextProps, nextState){
    return this.state.openDialog || nextState.openDialog;
  },

  updatePassword: function(event) {
    this.setState({password: event.target.value})
  },

  updatePasswordConfirmation: function(event) {
    this.setState({passwordConfirmation: event.target.value})
  },

  clickChange: function(event){
    if (this.state.password === this.state.passwordConfirmation && passwordOK(this.state.password)) {
      this.setState({busy: true});
      this.props.user.changePassword(this.state.password, function(success, returned){
        this.setState({busy: false});
        if (success) {
          this.setState({openDialog: false, busy: false});
          this.props.onCompleted(null);
        }
        else {
          this.setState({busy: false, password: "", passwordConfirmation: ""});
          navigator.notification.alert("Passwords must match and fulfill the strength requirements,",
            null, "Change Password Failed", "OK");
        }
      }.bind(this));
    }
    else {
      this.setState({password: "", passwordConfirmation: ""});
      navigator.notification.alert("Passwords must match and fulfill the strength requirements,",
        null, "Change Password Failed", "OK");
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
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
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
          <Button type='button' onClick={this.clickChange}>Change</Button>
        </DialogActions>
      </Dialog>
    )
  }
})

module.exports = ChangePassword;
