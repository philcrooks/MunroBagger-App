"use strict"

const Mountain = require('./mountain');
const ApiRequest = require('./api_request');
const logger = require('../utility').logger;
const localStorage = (process.env.NODE_ENV === 'test') ? require("../utility").localStorage : window.localStorage;

const baseURL = "https://www.munrobagger.scot/";
// const baseURL = "http://localhost:3000/";
// const baseURL = "http://192.168.1.124:3000/";
const mountainKey = "mountains";
const updatedKey = "updated_at";
const refreshKey = "refresh_at";

var Mountains = function(){
  this._mountains = this._retrieveFromStore();
  this._nextUpdate = parseInt(localStorage.getItem(refreshKey), 10);

  Object.defineProperty(this, "nextUpdate", { get: function(){ return this._nextUpdate; } });
  Object.defineProperty(this, "updateInterval", { get: function(){
    const now = Date.now();
    return (this._nextUpdate > now) ? this._nextUpdate - now : 0;
  } });
};

Mountains.prototype._fetchFromNetwork = function(resource, onCompleted) {
  const url = baseURL + resource;
  const apiRequest = new ApiRequest();
  apiRequest.makeGetRequest(url, null, false, function(status, receivedResource) {
    onCompleted(receivedResource);
  });
}

Mountains.prototype.fetchForecasts = function(onCompleted) {
  logger("Requesting forecasts from server")
  this._fetchFromNetwork("forecasts", function(rxForecasts) {
    logger("Forecasts received from network")
    if (this._updateForecasts(rxForecasts))
      this._saveToStore(this._mountains);
    else
      rxForecasts = null;
    onCompleted(rxForecasts);
  }.bind(this))
}

Mountains.prototype.fetchMountains = function(onCompleted) {
  logger("Requesting mountains from server")
  this._fetchFromNetwork("munros", function(rxMountains) {
    logger("Mountains received from network")
    this._mountains = rxMountains;
    this._saveToStore(rxMountains);
    onCompleted(rxMountains);
  }.bind(this))  
}

Mountains.prototype.all = function(onCompleted) {
  let mountains = [];
  if (this._mountains) {
    // Have already downloaded the mountains
    if (this._needUpdate()) {
      // The forecasts are probably out of date and should be refreshed
      this.fetchForecasts(function(){
        mountains = this._makeMountains(this._mountains);
        onCompleted(mountains);
      }.bind(this));
    }
    else {
      mountains = this._makeMountains(this._mountains);
      onCompleted(mountains);
    }
  }
  else {
    // Don't have cached mountains so need to download them
    this.fetchMountains(function(receivedMtns) {
      mountains = this._makeMountains(this._mountains);
      onCompleted(mountains)
    }.bind(this));
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
      return true;
    }
  }
  return false;
}

Mountains.prototype._getTimestamp = function(mountains) {
  let lastUpdate = "";
  for (let i = 0; i < mountains.length; i++) {
    let updatedAt = mountains[i].forecast.updated_at;
    if (lastUpdate < updatedAt) lastUpdate = updatedAt;
  }
  // Return a count of the milliseconds elapsed between 1 January 1970 00:00:00 UTC and the last update
  return new Date(lastUpdate).getTime();
}

Mountains.prototype._saveToStore = function(mountains) {
  if (mountains) {
    logger("Saving mountains to store")
    const timeStamp = this._getTimestamp(mountains);  // UTC time
    // Next update will be approx two hours from the last one
    this._nextUpdate = timeStamp + ((2.05 + (Math.random() / 4)) * 60 * 60 * 1000);
    logger("Forecasts updated:", new Date(timeStamp).toISOString());
    logger("Refresh scheduled:", new Date(this._nextUpdate).toISOString());
    localStorage.setItem(updatedKey, timeStamp.toString());
    localStorage.setItem(refreshKey, this._nextUpdate.toString());
    localStorage.setItem(mountainKey, JSON.stringify(mountains));
  }
}

Mountains.prototype._retrieveFromStore = function() {
  let mountains = JSON.parse(localStorage.getItem(mountainKey));
  logger("Retrieving Mountains from store")
  return mountains;
}

Mountains.prototype._needUpdate = function() {
  let updatedAt = parseInt(localStorage.getItem(updatedKey), 10);
  logger("Mountain forecasts last updated", Math.round((Date.now() - updatedAt) / 600) / 100, "minutes ago");
  return (Date.now() > this._nextUpdate);
}

module.exports = Mountains;
