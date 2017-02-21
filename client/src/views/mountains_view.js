"use strict"

var Mountains = require('../models/mountains');
var MountainView = require('./mountain_view');
var search = require('../utility').mountainSearch;

var MountainsView = function() {
  this._mountainsModel = new Mountains();
  this.mountains = null;
  this._user = null;
  this._forecastDates = {
    _min: null,
    _max: null,
    _baseDate: null,
    get min() { return this._min; },
    get max() { return this._max; },
    get baseDate() { return this._baseDate; },
    get aligned() { return (this._min && this._min === this._max); },
    reset: function() { this._min = this._max = this._baseDate = null; },
    add: function(sDate) {
      if (!this._min || this._min > sDate) this._min = sDate;
      if (!this._max || this._max < sDate) this._max = sDate;
    }
  }

  Object.defineProperty(this, "nextUpdate", { get: function(){ return this._mountainsModel.nextUpdate; } });
  Object.defineProperty(this, "updateInterval", { get: function(){ return this._mountainsModel.updateInterval; } });
  Object.defineProperty(this, "forecastDates", { get: function(){ return this._forecastDates; } });
}

MountainsView.prototype.all = function(onCompleted) {
  this._mountainsModel.all(function(mtns){
    this._forecastDates._baseDate = new Date(mtns[0].forecasts.day[0].date); // All forecasts have the same first date
    this.mountains = mtns.map(function(mtn) {
      this._forecastDates.add(mtn.forecasts.dataDate);
      const mv = new MountainView(mtn);
      mv.createStatus = this.newBaggedRecord.bind(this);
      mv.saveStatus = this.saveBaggedRecord.bind(this);
      return mv;
    }.bind(this));
    onCompleted(this.mountains);
  }.bind(this));
}

MountainsView.prototype.updateForecasts = function(onCompleted) {
  this._mountainsModel.fetchForecasts(function(forecasts){
    if (forecasts) {
      this._forecastDates.reset();
      for (let i = 0; i < this.mountains.length; i++) {
        this.mountains[i].detail.updateForecast(forecasts[i]);
        this._forecastDates.add(this.mountains[i].detail.forecasts.dataDate);
      };
      this._forecastDates._baseDate = new Date(this.mountains[0].detail.forecasts.day[0].date); // All forecasts have the same first date

    };
    onCompleted();
  }.bind(this));
}

MountainsView.prototype._clearMountains = function() {
  for (let i = 0; i < this.mountains.length; i++) {
    this.mountains[i].status = null;
  }
}

MountainsView.prototype.userLogin = function(user) {
  this._user = user;
  // clear any existing user settings
  this._clearMountains();

  let mtn;
  let user_mtns = user.baggedList;
  for (let i = 0; i < user_mtns.length; i++) {
    mtn = search(this.mountains, user_mtns[i].id);
    mtn.status = user_mtns[i];
  }
}

MountainsView.prototype.userLogout = function() {
  this._user = null;
  this._clearMountains();
}

MountainsView.prototype.newBaggedRecord = function(id) {
  if (!this._user) return null; // this shouldn't happen
  return this._user.createUserMountain(id)
}

MountainsView.prototype.saveBaggedRecord = function(bagged, callback) {
  if (!this._user) return null;
  return this._user.saveUserMountain(bagged, callback);
}

module.exports = MountainsView;