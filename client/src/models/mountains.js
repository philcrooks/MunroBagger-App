const Mountain = require('./mountain');
const ApiRequest = require('./api_request');
const logger = require('../utility').logger;

const baseURL = "https://www.munrobagger.scot/";
// const baseURL = "http://localhost:3000/";
// const baseURL = "http://192.168.1.124:3000/";
const mountainKey = "mountains";
const updatedKey = "updated_at";
const refreshKey = "refresh_at";

var Mountains = function(){
  this._mountains = this._retrieveFromStore();
  this._nextUpdate = parseInt(window.localStorage.getItem(refreshKey), 10);

  Object.defineProperty(this, "nextUpdate", { get: function(){ return this._nextUpdate; } });
  Object.defineProperty(this, "updateInterval", { get: function(){
    const now = Date.now();
    return (this._nextUpdate > now) ? this._nextUpdate - now : 0;
  } });
};

Mountains.prototype.fetchForecasts = function(onCompleted) {
  const url = baseURL + "forecasts";
  const apiRequest = new ApiRequest();
  apiRequest.makeGetRequest(url, null, false, function(status, receivedForecasts) {
    this._updateForecasts(receivedForecasts);
    this._saveToStore(this._mountains);
    onCompleted(receivedForecasts);
  }.bind(this))
}

Mountains.prototype._fetchMountains = function(onCompleted) {
  const url = baseURL + "munros";
  const apiRequest = new ApiRequest();
  apiRequest.makeGetRequest(url, null, false, function(status, receivedMtns) {
    this._saveToStore(receivedMtns);
    mountains = this._makeMountains(receivedMtns);
    onCompleted(mountains);
  }.bind(this))  
}

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
    this._fetchMountains(onCompleted);
  }
};

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

Mountains.prototype._getTimestamp = function(mountains) {
  let lastUpdate = "";
  for (let i = 0; i < mountains.length; i++) {
    let updatedAt = mountains[i].forecast.updated_at;
    if (lastUpdate < updatedAt) lastUpdate = updatedAt;
  }
  return new Date(lastUpdate).getTime();
}

Mountains.prototype._saveToStore = function(mountains) {
  if (mountains) {
    logger("Saving Mountains")
    const timeStamp = this._getTimestamp(mountains);  // UTC time
    this._nextUpdate = timeStamp + ((2.05 + (Math.random() / 4)) * 60 * 60 * 1000);
    logger("Forecasts updated:", new Date(timeStamp).toISOString());
    logger("Refresh scheduled:", new Date(this._nextUpdate).toISOString());
    window.localStorage.setItem(updatedKey, timeStamp.toString());
    window.localStorage.setItem(refreshKey, this._nextUpdate.toString());
    window.localStorage.setItem(mountainKey, JSON.stringify(mountains));
  }
}

Mountains.prototype._retrieveFromStore = function() {
  let mountains = JSON.parse(window.localStorage.getItem(mountainKey));
  logger("Retrieving Mountains from store", mountains)
  return mountains;
}

Mountains.prototype._needUpdate = function() {
  let updatedAt = parseInt(window.localStorage.getItem(updatedKey), 10);
  logger("Mountains last updated", Math.round((Date.now() - updatedAt) / 600) / 100, "minutes ago");
  return (Date.now() > this._nextUpdate);
}

module.exports = Mountains;
