"use strict"

const Mountain = require('./mountain');
const ApiRequest = require('./api_request');
const logger = require('../utility').logger;
const localStorage = (process.env.NODE_ENV === 'test') ? require("../stubs").localStorage : window.localStorage;

const baseURL = "https://www.munrobagger.scot/";
// const baseURL = "http://localhost:3000/";
// const baseURL = "http://192.168.1.124:3000/";
const mountainKey = "mountains";
const updatedKey = "updated_at";
const refreshKey = "refresh_at";

var Mountains = function(){
  this._mountains = this._retrieveFromStore();
  this._nextUpdate = parseInt(localStorage.getItem(refreshKey), 10);
  this._lastUpdate = parseInt(localStorage.getItem(updatedKey), 10);

  Object.defineProperty(this, "nextUpdate", { get: function(){ return this._nextUpdate; } });
  Object.defineProperty(this, "lastUpdate", { get: function(){ return this._lastUpdate; } });
  Object.defineProperty(this, "updateInterval", { get: function(){
    const now = Date.now();
    return (this._nextUpdate > now) ? this._nextUpdate - now : 0;
  } });
};

Mountains.prototype._fetchFromNetwork = function(resource, onCompleted) {
  const url = baseURL + resource;
  const apiRequest = new ApiRequest();
  apiRequest.makeGetRequest(url, null, false, function(status, receivedResource) {
    // Reverse the order of the params so the status can be ignored
    onCompleted(receivedResource, status);
  });
}

Mountains.prototype.fetchForecasts = function(onCompleted) {
  logger("Requesting forecasts from server")
  let requestString = "forecasts?time=" + encodeURIComponent(new Date(this._lastUpdate).toISOString());
  this._fetchFromNetwork(requestString, function(rxForecasts, status) {
    logger("Forecasts response received from server")
    if (status === 200) {
      if (this._updateForecasts(rxForecasts))
        this._saveToStore(this._mountains);
      else
        rxForecasts = null;
    }
    else {
      if (status === 304) {
        // Forecasts have not been updated since the last request
        // Set the update time for one hour in the future
        this._nextUpdate = this._updateTime();
      }
      rxForecasts = null;
    }
    onCompleted(rxForecasts);
  }.bind(this))
}

Mountains.prototype.fetchMountains = function(onCompleted) {
  logger("Requesting mountains from server")
  this._fetchFromNetwork("munros", function(rxMountains) {
    logger("Mountains response received from server")
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
  let length = this._mountains.length;
  let i = 0;
  if (forecasts && forecasts.length === length) {
    for ( ; i < length; i++) {
      if ((this._mountains[i].id === forecasts[i].munro_id)) {
        this._mountains[i].forecast.data = forecasts[i].data;
        this._mountains[i].forecast.updated_at = forecasts[i].updated_at;
      }
      else break;
    }
  }
  return (i === length);
}

Mountains.prototype._getTimestamp = function(mountains) {
  let lastUpdate = "";
  for (let i = 0; i < mountains.length; i++) {
    let updatedAt = mountains[i].forecast.updated_at;
    if (lastUpdate < updatedAt) lastUpdate = updatedAt;
  }
  // Return a count of the milliseconds elapsed between 1 January 1970 00:00:00 UTC and the last update
  return new Date(lastUpdate);
}

Mountains.prototype._saveToStore = function(mountains) {
  if (mountains) {
    logger("Saving mountains to store")
    let timestamp = this._getTimestamp(mountains);  // UTC time
    this._lastUpdate = timestamp.getTime();
    this._nextUpdate = this._updateTime(this._lastUpdate);
    logger("Forecasts updated:", new Date(this._lastUpdate).toISOString());
    logger("Refresh scheduled:", new Date(this._nextUpdate).toISOString());
    localStorage.setItem(updatedKey, this._lastUpdate.toString());
    localStorage.setItem(refreshKey, this._nextUpdate.toString());
    localStorage.setItem(mountainKey, JSON.stringify(mountains));
  }
}

Mountains.prototype._retrieveFromStore = function() {
  let mountains = JSON.parse(localStorage.getItem(mountainKey));
  logger("Retrieving Mountains from store")
  return mountains;
}

Mountains.prototype._updateTime = function(lastUpdate) {
  // this._lastUpdate is the timestamp put into the forecast when the server updated it
  // this._nextUpdate is a value calculated by this app.
  // If the server has trouble with updates, no new forecasts will be available and this._lastUpdate will not be updated.
  // New forecasts should be requested every hour on the hour (roughly).
  // Our server only updates once every two hours but the Met Office server sometimes updates hourly so an hourly update makes more sense.

  let update = (lastUpdate) ? new Date(lastUpdate) : new Date();
  update.setUTCHours(update.getUTCHours() + Math.round(update.getUTCMinutes() / 60));
  update.setUTCMinutes(0,0,0);
  let t_ms = update.getTime();
  let t_adjust = (t_ms > Date.now()) ? 0 : 1;
  t_adjust += (Math.random() / 4);
  return (t_ms + (t_adjust * 60 * 60 * 1000));
}

Mountains.prototype._needUpdate = function() {
  let updatedAt = parseInt(localStorage.getItem(updatedKey), 10);
  logger("Mountain forecasts last updated", Math.round((Date.now() - updatedAt) / 600) / 100, "minutes ago");
  return (Date.now() > this._nextUpdate);
}

module.exports = Mountains;
