var Mountains = require('../models/mountains');
var MountainView = require('./mountain_view');
var search = require('../utility').mountainSearch;

var MountainsView = function() {
  this._mountainsModel = new Mountains();
  this.mountains = null;
  this._user = null;
  this._forecastDate = {
    _min: null,
    _max: null,
    _ave: 0,
    get min() { return this._min; },
    get max() { return this._max; },
    get ave() {
      let sDate = new Date(this._ave).toISOString();
      return sDate.split(".")[0] + "Z";
    },
    get aligned() {
      return (this._min && this._min === this._max);
    }
  }

  Object.defineProperty(this, "nextUpdate", { get: function(){ return this._mountainsModel.nextUpdate; } });
  Object.defineProperty(this, "updateInterval", { get: function(){ return this._mountainsModel.updateInterval; } });
  Object.defineProperty(this, "forecastDate", { get: function(){ return this._forecastDate; } });
}

MountainsView.prototype.all = function(onCompleted) {
  this._mountainsModel.all(function(mtns){
    this.mountains = mtns.map(function(mtn) {
      var mv = new MountainView(mtn);
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
      for (let i = 0; i < this.mountains.length; i++) {
        this.mountains[i].detail.updateForecast(forecasts[i]);
        if (!this._forecastDate._min || this._forecastDate._min > this.mountains[i].detail.forecasts.dataDate)
          this._forecastDate._min = this.mountains[i].detail.forecasts.dataDate;
        if (!this._forecastDate._max || this._forecastDate._max < this.mountains[i].detail.forecasts.dataDate)
          this._forecastDate._max = this.mountains[i].detail.forecasts.dataDate;
        this._forecastDate._ave += new Date(this.mountains[i].detail.forecasts.dataDate).getTime();
      };
      this._forecastDate._ave = this._forecastDate._ave / this.mountains.length;
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