var Mountains = require('../models/mountains');
var MountainView = require('./mountain_view');
var search = require('../utility').mountainSearch;

var MountainsView = function() {
  this._mountainsModel = new Mountains();
  this.mountains = null;
  this._user = null;

  Object.defineProperty(this, "nextUpdate", { get: function(){ return this._mountainsModel.nextUpdate; } });
  Object.defineProperty(this, "updateInterval", { get: function(){ return this._mountainsModel.updateInterval; } });

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
  console.log("Updating forecasts")
  this._mountainsModel.fetchForecasts(function(forecasts){
    if (forecasts) {
      let length = this.mountains.length;
      if ((this.mountains[0].id === forecasts[0].munro_id) && (length === forecasts.length)) {
        for (let i = 0; i < length; i++) {
          this.mountains[i].detail.updateForecast(forecasts[i]);
        };
      };
    };
    onCompleted();
  }.bind(this));
}

MountainsView.prototype._clearMountains = function() {
  for (let i = 0; i < this.mountains; i++) {
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