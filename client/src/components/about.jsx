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
        <div className='about-heading'>
          <span className='about-heading-title'>Munro Bagger</span>
          <span className='about-heading-version'>Version {AppVersion.version}</span>
        </div>
        <DialogContent>
          <div className='about'>
            <p style={{padding: '0'}}>
              Munro Bagger was originally created as a <a target="_blank"
              href="https://codeclan.com/">CodeClan</a> project by Phil Crooks, John Easton & Sian Robinson
              Davies of Cohort 6. This app is a derivative of that work and was created by Phil Crooks.
            </p>
            <p>If you have any questions or suggestions, please get in touch using Twitter or email.</p>
            <p><span className='comms'>Twitter:</span><a target="_blank" href="https://twitter.com/@MunroBaggerScot">@MunroBaggerScot</a></p>
            <p><span className='comms'>Email:</span><a href="mailto:team@munrobagger.scot">team@munrobagger.scot</a></p>
          </div>
        </DialogContent>
        <DialogActions>
          <Button type='button' onClick={this.clickClose}>Close</Button>
        </DialogActions>
      </Dialog>
    )
  }
})

module.exports = About;
