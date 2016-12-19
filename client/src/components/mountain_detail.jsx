const React = require('react');

import { FABButton, Icon } from 'react-mdl';

// const DatePicker = require('react-datepicker');
// const moment = require('moment');
const MountDetailBagged = require('./mountain_detail_bagged');
const dayOfWeek = require('../utility').dayOfWeek;

// require('react-datepicker/dist/react-datepicker.css');

const MountDetail = React.createClass({

  getInitialState: function() {
    return({ visible: false })
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.willDisplay) this.setState({ visible: true })
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return (this.props.mountain !== nextProps.mountain) ||
      (this.props.dayNum !== nextProps.dayNum) ||
      (this.state.visible !== nextState.visible);
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
    const directions = { N: "North", E: "East", S: "South", W: "West" }
    if (direction.length == 1) return directions[direction]
    return direction
  },

  clickClose: function() {
    this.setState({visible: false})
    this.props.onCompleted();
  },

  handleDateChange: function(date) {
    this.setState({
      startDate: date
    });
    this.props.date(date)
  },

  handleBaggedChange: function(event) {
    let status = event.target.checked;
    this.props.bagged(status)
  },

  render: function() {

    if (!this.props.mountain) {
      return(<div className='mountain'></div>);
    }

    const detail = this.props.mountain.detail;
    const forecast = detail.forecasts.day[this.props.dayNum];

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

    let bagged = null;
    if (this.props.userLoggedIn) {
      bagged = (
        <MountDetailBagged
          focusMount={this.props.focusMount}
          bagged={this.props.bagged}
          disabled={this.props.disabled} />
      )
    }

    let classes = (this.state.visible) ? "mountain is-visible" : "mountain";
    return (
      <div className={classes}>
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
            <div className="grid-item">{forecast.description}</div>
            <div className="grid-item">Visibility:</div>
            <div className="grid-item">{forecast.visibility}</div>
            <div className="grid-item">Temperature:</div>
            <div className="grid-item">High of {forecast.temperature.max}&deg;C</div>
            <div className="grid-item"></div>
            <div className="grid-item">Feels like {forecast.temperature.feelsLike}&deg;C</div>
            <div className="grid-item">Wind:</div>
            <div className="grid-item">{forecast.wind.speed}mph {this.formatDirection(forecast.wind.direction)}</div>
            <div className="grid-item"></div>
            <div className="grid-item">Gusts of {forecast.wind.gusting}mph</div>
          </div>
        </div>
        <div className='mountain-actions'>
          {bagged}
          <FABButton mini onClick={this.clickClose}><Icon name="save" /></FABButton>
          <FABButton mini onClick={this.clickClose}><Icon name="arrow_forward" /></FABButton>
        </div>
      </div>
    )

  }
})

module.exports = MountDetail;
