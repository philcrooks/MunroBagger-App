var compassBearing = require('../utility').compassBearing;

function Pin (map, mtnView) {
  // this._id = mtnView.id;
  this._mtnView = mtnView;
  this._map = map;
  this._dayNum = 0;
  this._loggedIn = false;
  this._mountBagged = mtnView.bagged;
  this._forecasts = mtnView.detail.forecasts;
  this._mountSunny = (this._forecasts.day[0].code <= 3)
  this._marker = null;
  this._markerCallback = null;
  this._hasFocus = false;
  this._userClosedInfoWin = false;
  this._infoWindow = null;

  Object.defineProperty(this, "id", { get: function(){ return this._mtnView.id; } });
};

Pin.prototype.changeForecast = function(dayNum) {
  let sunnyForecast = (this._forecasts.day[dayNum].code <= 3)
  this._dayNum = dayNum;
  if (this._mountSunny !== sunnyForecast) {
    this._mountSunny = sunnyForecast
    this._marker.setMap(null);
    this._resetMarker();
  }
  else {
    if (this._hasFocus) this._openInfoWindow();
  }
}

Pin.prototype.changeBaggedState = function(bagged) {
  this._mountBagged = bagged;
  this._marker.setMap(null);
  this._resetMarker();
}

Pin.prototype.userLoggedIn = function(bagged) {
  this._loggedIn = true;
  this.changeBaggedState(bagged);
}

Pin.prototype.userLoggedOut = function() {
  this._loggedIn = false;
  this.changeBaggedState(false);
}

Pin.prototype._resetMarker = function() {
  this._marker =  new google.maps.Marker({
    position: this._mtnView.detail.latLng,
    map: this._map,
    icon: { url: this._generateIcon(), scaledSize: new google.maps.Size(19, 19) }
  });
  if (this._hasFocus) this._openInfoWindow();
  google.maps.event.addListener(this._marker, 'click', function(){
    this._markerCallback(this._mtnView);
  }.bind(this));
}

Pin.prototype.createMarker = function(callback) {
  this._markerCallback = callback;
  this._resetMarker()
};

Pin.prototype._openInfoWindow = function(){
  if (this._userClosedInfoWin) return;
  const forecast = this._forecasts.day[this._dayNum];
  const infoWindow = new google.maps.InfoWindow({
      content:
        "<h6>" + this._mtnView.detail.name + "</h6>" +
        "<div class='flex-grid'>\
          <div class='grid-item'>Weather:</div>\
          <div class='grid-item'>" + forecast.description + "</div>\
          <div class='grid-item'>Temperature:</div>\
          <div class='grid-item'>High of " + forecast.temperature.max + "&deg;C</div>\
          <div class='grid-item'>Wind:</div>\
          <div class='grid-item'>" + forecast.wind.speed + "mph " + compassBearing(forecast.wind.direction) + "</div>\
        </div>\
        <button class='mdl-button' style='float: right'>\
          More Info\
        </button>",
      maxWidth: 240
  });
  infoWindow.open(this._map, this._marker);
  google.maps.event.addListener(infoWindow,'closeclick',function(){
    this._userClosedInfoWin = true;
    this._infoWindow = null;
  }.bind(this));
  if (this._infoWindow) this._infoWindow.close();
  this._infoWindow = infoWindow;
};

Pin.prototype.setFocus = function() {
  this._hasFocus = true;
  this._userClosedInfoWin = false;
  this._openInfoWindow();
  return this;
}

Pin.prototype.clearFocus = function() {
  this._hasFocus = false;
  if (this._infoWindow !== null) this._infoWindow.close();
  this._infoWindow = null;
}

Pin.prototype._generateIcon = function(){
  var base = "./img/";
  var fileName = base + "mntn-";
  if (this._loggedIn) {
    if (!this._mountBagged) fileName += "not-";
    fileName += "bagged";
    if (this._mountSunny) fileName += "-sunny";
  }
  else {
    if (!this._mountSunny) fileName += "not-";
    fileName += "sunny";
  }
  fileName += ".png";
  return fileName;
}

module.exports = Pin;
