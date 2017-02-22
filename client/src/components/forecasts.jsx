const React = require('react');
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from 'react-mdl';
const logger = require('../utility').logger;
const dateString = require('../utility').dateString;
const timeString = require('../utility').timeString;

const Forecasts = React.createClass({

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

    let info = null;
    if (this.props.forecastDates) {
      info = "The current forecasts were published by the Met Office";
      const min = this.props.forecastDates.min;
      const minDate = new Date(min);
      const minDateString = dateString(minDate);
      const minTimeString = timeString(minDate);
      if (this.props.forecastDates.aligned) {
        info += " on the " + minDateString + " at " + minTimeString;
      }
      else {
        const max = this.props.forecastDates.max;
        const maxDate = new Date(max);
        const maxDateString = dateString(maxDate);;
        if (minDateString === maxDateString)
          info += " on the " + minDateString + " between " + minTimeString + " and ";
        else
          info += " between " + minDateString + " at " + minTimeString + " and " + maxDateString + " at ";
        info += timeString(maxDate);
      }
      const uploaded = this.props.forecastDates.updatedBy;
      info += " and were uploaded to our server by " + dateString(uploaded) + " at " + timeString(uploaded) + ".";
    }

    return (
      <Dialog open={this.state.openDialog}>
        <DialogTitle>Forecasts</DialogTitle>
        <DialogContent>
          <div className='about'>
            <p style={{padding: '0'}}>
              The forecasts used by this app are known as <a href="http://www.metoffice.gov.uk/datapoint/product/uk-daily-site-specific-forecast" target="_blank" >
              UK daily site specific forecasts</a> and are produced by the <a href="http://www.metoffice.gov.uk" target="_blank" >UK Met Office</a>.
              Each Munro has its own forecasts which are updated by the Met Office every few hours, as necessary.
            </p>
            <p>
              Note that the app will show daytime forecasts regardless of the time of day.
            </p>
            <p>
              {info}
            </p>
          </div>
        </DialogContent>
        <DialogActions>
          <Button type='button' onClick={this.clickClose}>Close</Button>
        </DialogActions>
      </Dialog>
    )
  }
})

module.exports = Forecasts;
