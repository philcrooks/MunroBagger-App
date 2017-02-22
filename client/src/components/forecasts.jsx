const React = require('react');
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from 'react-mdl';
const logger = require('../utility').logger;
const dateString = require('../utility').dateString;
const timeString = require('../utility').timeString;

const Forecasts = React.createClass({

  getInitialState: function() {
    return {
      openDialog: false,
      min: null,
      max: null,
      updatedBy: null
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.willDisplay) {
      if (nextProps.forecastDates) {
        this.setState({
          openDialog: true,
          min: nextProps.forecastDates.min,
          max: nextProps.forecastDates.max,
          updatedBy: nextProps.forecastDates.updatedBy
        });
      }
      else {
        this.setState({ openDialog: true });        
      }
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

    logger("Rendering Forecasts");

    let info = null;
    if (this.state.min && this.state.max && this.state.updatedBy) {
      info = "The current forecasts were produced by the Met Office";
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
              {info}
            </p>
            <p>
              Note that the app will show daytime forecasts regardless of the time of day.
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
