"use strict"

const Forecast = require("./forecast");

const Forecasts = function(forecasts){

  this._dataDate = forecasts.data.dataDate;
  this._updatedAt = forecasts.updated_at;
  this._forecasts = [];
  let days = forecasts.data.days;
  for (let i = 0; i < days.length; i++) {
  	this._forecasts.push(new Forecast(days[i]));
  }

  Object.defineProperty(this, "dataDate", { get: function(){ return this._dataDate; } });
  Object.defineProperty(this, "day", { get: function(){ return this._forecasts; } });
  Object.defineProperty(this, "updatedAt", { get: function(){ return this._updatedAt; } });
};

module.exports = Forecasts;