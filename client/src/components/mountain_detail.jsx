const React = require('react');

import { Checkbox, FABButton, Icon, Spinner } from 'react-mdl';

// const DatePicker = require('react-datepicker');
// const moment = require('moment');
const dayOfWeek = require('../utility').dayOfWeek;
const logger = require('../utility').logger;

// require('react-datepicker/dist/react-datepicker.css');

const MountDetail = React.createClass({

  getInitialState: function() {

    return({
      visible: false,
      saveEnabled: false,
      baggedEnabled: false,
      bagged: false,
      updating: false,
      busy: false
    });
  },

  componentWillReceiveProps: function(nextProps) {
    // Don't allow sate to change until save is completed
    if (this.state.updating) return;
    if (nextProps.willDisplay) this.setState({visible: nextProps.willDisplay});
    if ((this.props.mountain !== nextProps.mountain) ||
       (this.props.userLoggedIn !== nextProps.userLoggedIn)) {
      const bagged = (nextProps.mountain && nextProps.mountain.bagged) ? true : false;
      this.setState({
        saveEnabled: false,
        baggedEnabled: nextProps.userLoggedIn,
        bagged: bagged
      });
    };
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    let should = (this.props.dayNum !== nextProps.dayNum) ||
      (this.props.userLoggedIn !== nextProps.userLoggedIn) ||
      (this.state.visible !== nextState.visible) ||
      (this.state.bagged !== nextState.bagged) ||
      (this.state.saveEnabled !==  nextState.saveEnabled) ||
      (this.state.baggedEnabled !== nextState.baggedEnabled);
    should = should || ((this.props.mountain !== nextProps.mountain) && !this.state.updating);
    return should;
  },

  formatDay: function() {
    const day = this.props.baseDate.getDay();
    let days = ["Today", "Tomorrow", dayOfWeek((day+2)%7, false)];
    if (this.props.baseDate.toDateString() !== new Date().toDateString()) {
      days[0] = dayOfWeek(day, false);
      days[1] = dayOfWeek((day+1)%7, false);
    }
    return days[this.props.dayNum];
  },

  formatDirection: function(direction) {
    if (!direction) return null;
    const directions = { N: "North", E: "East", S: "South", W: "West" }
    if (direction.length == 1) return directions[direction]
    return direction
  },

  clickClose: function() {
    this.setState({visible: false})
    this.props.onCompleted();
  },

  clickSave: function() {
    // This will only be called if save is enabled
    // Save will only be enabled if the bagged status changes somehow
    // The bagged status can only change if the user is logged in
    this.setState({baggedEnabled: false, saveEnabled: false, updating: true})
    const mtn = this.props.mountain;
    let status = this.state.bagged;

    mtn.backup();         // Backup the mountain status
    mtn.bagged = status;  // Update the status
    let request = mtn.save(function(success, returned) {
      if (!success) {
        status = !status;
        mtn.restore();    // The request failed so restore the mountain status
        navigator.notification.alert(returned.message, null, "Update Failed", "OK");
      }
      this.setState({baggedEnabled: true, bagged: status, updating: false, busy: false});
    }.bind(this));
    if (request.status !== "sent") this.setState({busy: true});
  },

  handleDateChange: function(date) {
    this.setState({
      startDate: date
    });
    this.props.date(date)
  },

  handleBaggedChange: function(event) {
    let status = event.target.checked;
    this.setState({saveEnabled: this.props.mountain.bagged !== status, bagged: status})
  },

  render: function() {

    logger("Rendering MountainDetail");

    if (!this.props.mountain) {
      return(<div className='mountain'></div>);
    }

    const detail = this.props.mountain.detail;
    const forecast = detail.forecasts.day[this.props.dayNum];
    const saveOpts = (this.state.saveEnabled) ? {} : {disabled: "disabled"};
    const closeOpts = (this.state.updating) ? {disabled: "disabled"} : {};

    // Make sure long names break at the most appropriate point
    let name = detail.name;
    if (name.includes(",") || name.includes("(")) {
      let newName = "";
      for(let i = 0; i < name.length; i++) {
        let character = name.charAt(i);
        if ((character === " ") &&
          (name.charAt(i-1) !== " ") &&
          (name.charAt(i-1) !== ",") &&
          (name.charAt(i+1) !== "(")) {
            character = "\xa0"; // Non-breaking space
        }
        newName += character;
      }
      name = newName;
    }

    const classes = (this.state.visible) ? "mountain is-visible" : "mountain";
    const spinner = (this.state.busy) ? <div className='spinner-container'><Spinner singleColor /></div> : null;
    const unavailable = "Not available";
    const queries = "???";


    return (
      <div className={classes}>
        {spinner}
        <div className='mountain-title'>
          <h1>{name}</h1>
          <p>{detail.meaning}</p>
          <div className="flex-grid">
            <div className="grid-item">Height:</div>
            <div className="grid-item">{detail.height}m</div>
            <div className="grid-item">OS Grid Ref:</div>
            <div className="grid-item">{detail.gridRef.toString()}</div>
          </div>
        </div>
        <div className='mountain-supporting-text'>
          <div className="cond-title">Conditions for {this.formatDay()}</div>
          <div className="flex-grid">
            <div className="grid-item">Weather:</div>
            <div className="grid-item">{(forecast.description) ? forecast.description : unavailable}</div>
            <div className="grid-item">Visibility:</div>
            <div className="grid-item">{(forecast.visibility) ? forecast.visibility : unavailable}</div>
            <div className="grid-item">Temperature:</div>
            <div className="grid-item">High of {(forecast.temperature.max) ? forecast.temperature.max : queries}&deg;C</div>
            <div className="grid-item"></div>
            <div className="grid-item">Feels like {(forecast.temperature.feelsLike) ? forecast.temperature.feelsLike : queries}&deg;C</div>
            <div className="grid-item">Wind:</div>
            <div className="grid-item">{(forecast.wind.speed) ? forecast.wind.speed : queries}mph {(forecast.wind.direction) ? this.formatDirection(forecast.wind.direction) : queries}</div>
            <div className="grid-item"></div>
            <div className="grid-item">Gusts of {(forecast.wind.gusting) ? forecast.wind.gusting : queries}mph</div>
            <div className="grid-item">Precipitation:</div>
            <div className="grid-item">{(forecast.pofp) ? forecast.pofp : queries}% probability</div>
            <div className="grid-item">Humidity:</div>
            <div className="grid-item">{(forecast.humidity) ? forecast.humidity : queries}%</div>          
          </div>
          <Checkbox
            label="Bagged"
            disabled={!this.state.baggedEnabled}
            checked={this.state.bagged}
            onChange={this.handleBaggedChange} />
        </div>
        <div className='mountain-actions'>
          <FABButton mini {...saveOpts} onClick={this.clickSave}><Icon name="save" /></FABButton>
          <FABButton mini {...closeOpts} onClick={this.clickClose}><Icon name="arrow_forward" /></FABButton>
        </div>
      </div>
    )

  }
})

module.exports = MountDetail;
