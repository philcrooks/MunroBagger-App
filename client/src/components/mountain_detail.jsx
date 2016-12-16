const React = require('react');

import { Button, Card, CardTitle, CardText, CardActions } from 'react-mdl';

// const DatePicker = require('react-datepicker');
// const moment = require('moment');
const MountDetailBagged = require('./mountain_detail_bagged');
const dayOfWeek = require('../utility').dayOfWeek;

// require('react-datepicker/dist/react-datepicker.css');

const MountDetail = React.createClass({

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

    const detail = this.props.focusMount.detail;
    const forecast = detail.forecasts.day[this.props.dayNum];

    let bagged = null;
    if (this.props.userLoggedIn) {
      bagged = (
        <MountDetailBagged
          focusMount={this.props.focusMount}
          bagged={this.props.bagged}
          disabled={this.props.disabled} />
      )
    }

    return (
      <Card shadow={6} style={{position: 'absolute', width: '100%', height: '100%'}}>
        <CardTitle expand style={{display: 'block', background: '#3E4EB8', color: '#fff'}}>
          <h5 style={{margin: '5px 0px'}}>{detail.name}</h5>
          <p style={{margin: '0px'}}>({detail.meaning})</p>
        </CardTitle>
        <CardText>
          <div className="flex-grid">
            <div className="grid-item">Height:</div>
            <div className="grid-item">{detail.height}m</div>
            <div className="grid-item">OS Grid Ref:</div>
            <div className="grid-item">{detail.gridRef.toString()}</div>
          </div>
          <div className="cond-title"><h6 style={{color: 'black'}}>Conditions for {this.formatDay()}</h6></div>
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
        </CardText>
        <CardActions border style={{borderColor: 'rgba(255, 255, 255, 0.2)', display: 'flex', boxSizing: 'border-box', alignItems: 'center', color: '#fff'}}>
          {bagged}
          <Button type='button' onClick={this.clickClose}>Close</Button>
        </CardActions>
      </Card>
    )

  }
})

module.exports = MountDetail;
