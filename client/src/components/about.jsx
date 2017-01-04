const React = require('react');
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from 'react-mdl';

const About = React.createClass({

  getInitialState: function() {
    return {
      openDialog: false
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.willDisplay) {
      this.setState({
        openDialog: true
      });
    }
  },

  shouldComponentUpdate: function(nextProps, nextState){
    return this.state.openDialog || nextState.openDialog;
  },

  clickClose: function() {
    this.setState({openDialog: false});
    this.props.onCompleted(null);
  },

  render: function(){

    return (
      <Dialog open={this.state.openDialog}>
        <DialogTitle>About</DialogTitle>
        <DialogContent>
          <p>
            Munro Bagger was originally created as a <a className="user-link" target="_blank"
            href="https://codeclan.com/">CodeClan</a> project by Phil Crooks, John Easton & Sian Robinson
            Davies of Cohort 6. This app is a derivative of that work and was created by Phil Crooks.
          </p>
          <p style={{paddingTop: '8px'}}>
            If you have any questions or suggestions, please get in touch on Twitter or send us an email.
          </p>
          <p style={{paddingTop: '8px'}}>
            <span style={{display: 'inline-block', width: '45px'}}>Twitter:</span><a className="user-link" target="_blank" href="https://twitter.com/@MunroBaggerScot">@MunroBaggerScot</a><br/>
            <span style={{display: 'inline-block', width: '45px'}}>Email:</span><a className="user-link" href="mailto:munrobagger.scot@gmail.com">munrobagger.scot@gmail.com</a><br/>
          </p>
        </DialogContent>
        <DialogActions>
          <Button type='button' onClick={this.clickClose}>Close</Button>
        </DialogActions>
      </Dialog>
    )
  }
})

module.exports = About;
