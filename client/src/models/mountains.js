const Mountain = require('./mountain');
const ApiRequest = require('./api_request');
const logger = require('../utility').logger;

const baseURL = "http://www.munrobagger.scot/";
// const baseURL = "http://localhost:3000/";
// const baseURL = "http://192.168.1.124:3000/";
const mountainKey = "mountains";
const updateKey = "updated_at";

var Mountains = function(){
  this._mountains = this._retrieveFromStore();
};

Mountains.prototype.all = function(onCompleted) {
  let mountains = [];
  if (this._mountains) {
    // Have already downloaded the mountains
    if (this._needUpdate()) {
      // The forecasts are probably out of date and should be refreshed
      logger("Updating Forecasts")
      this.fetchForecasts(function(){
        mountains = this._makeMountains(this._mountains);
        onCompleted(mountains);
      }.bind(this));
    }
    else {
      logger("Using mountains as they are")
      mountains = this._makeMountains(this._mountains);
      onCompleted(mountains);
    }
  }
  else {
    // Don't have cached mountains so need to download them
    logger("Retrieving Mountains from Internet")
    const url = baseURL + "munros";
    const apiRequest = new ApiRequest();
    apiRequest.makeGetRequest(url, null, function(status, receivedMtns) {
      this._saveToStore(receivedMtns);
      mountains = this._makeMountains(receivedMtns);
      onCompleted(mountains);
    }.bind(this))
  }
};

Mountains.prototype.fetchForecasts = function(onCompleted) {
  const url = baseURL + "forecasts";
  const apiRequest = new ApiRequest();
  apiRequest.makeGetRequest(url, null, function(status, receivedForecasts) {
    this._updateForecasts(receivedForecasts);
    this._saveToStore(this._mountains);
    onCompleted(receivedForecasts);
  }.bind(this))
}

Mountains.prototype._makeMountains = function(receivedMtns) {
  const mtns = [];
  for (let i = 0; i < receivedMtns.length; i++) {
    let mtn = new Mountain(receivedMtns[i]);
    mtns.push(mtn);
  }
  return mtns;
}

Mountains.prototype._updateForecasts = function(forecasts) {
  if (forecasts) {
    let length = this._mountains.length;
    if ((this._mountains[0].id === forecasts[0].munro_id) && (length === forecasts.length)) {
      for (let i = 0; i < length; i++) {
        this._mountains[i].forecast.data = forecasts[i].data;
        this._mountains[i].forecast.updated_at = forecasts[i].updated_at;
      }
    } 
  }
}

Mountains.prototype._saveToStore = function(mountains) {
  if (mountains) {
    logger("Saving Mountains")
    window.localStorage.setItem(updateKey, Date.now().toString());
    window.localStorage.setItem(mountainKey, JSON.stringify(mountains));
  }
}

Mountains.prototype._retrieveFromStore = function() {
  let mountains = JSON.parse(window.localStorage.getItem(mountainKey));
  logger("Retrieving Mountains from store", mountains)
  return mountains;
}

Mountains.prototype._needUpdate = function() {
  const oneHour = 60 * 60 * 1000;
  let updatedAt = parseInt(window.localStorage.getItem(updateKey), 10);
  if (!isNaN(updatedAt)) logger("Mountains last updated", Math.round((Date.now() - updatedAt) / 600) / 100, "minutes ago");
  return isNaN(updatedAt) || (Date.now() > updatedAt + oneHour);
}

module.exports = Mountains;
