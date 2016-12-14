var InfoBox = require('./infobox');

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
  this._infoCallback = null;
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
    icon: { url: this._generateIcon(), scaledSize: new google.maps.Size(17, 20) }
  });
  if (this._hasFocus) this._openInfoWindow();
  google.maps.event.addListener(this._marker, 'click', function(){
    this._markerCallback(this._mtnView);
  }.bind(this));
}

Pin.prototype.createMarker = function(markerCallback, infoCallback) {
  this._markerCallback = markerCallback;
  this._infoCallback = infoCallback;
  this._resetMarker()
};

Pin.prototype._createInfoWindow = function(infoCallback, closeCallback) {
  let outerSpan = document.createElement("span");
  outerSpan.classList.add("mdl-chip", "mdl-chip--contact", "mdl-chip--deletable");
  outerSpan.style.backgroundColor = "white";
  outerSpan.style.cursor = "pointer"
  outerSpan.style.padding = "1px";

  let iconSpan = document.createElement("span");
  iconSpan.classList.add("mdl-chip__contact", "mdl-color--indigo", "mdl-color-text--white");
  iconSpan.style.fontFamily = "baskerville";
  iconSpan.style.fontWeight = "bold";
  iconSpan.style.fontStyle = "italic";
  iconSpan.textContent = "i";
  iconSpan.onclick = infoCallback;
  outerSpan.appendChild(iconSpan);

  let textSpan = document.createElement("span");
  textSpan.classList.add("mdl-chip__text");
  textSpan.style.fontWeight = "bold";
  textSpan.textContent = this._mtnView.name;
  textSpan.onclick = infoCallback
  outerSpan.appendChild(textSpan);

  let closer = document.createElement("span");
  closer.classList.add("mdl-chip__action");
  closer.onclick = closeCallback;

  let icon = document.createElement("i");
  icon.classList.add("material-icons");
  icon.textContent = "cancel";
  closer.appendChild(icon);
  outerSpan.appendChild(closer);

  const infoBoxOpts = {
    disableAutoPan: false,
    alignMiddle: true,
    alignBottom: true,
    pixelOffset: new google.maps.Size(0, -24),
    zIndex: null,
    boxStyle: {
      padding: "0px"
    },
    closeBoxURL : "",
    infoBoxClearance: new google.maps.Size(5, 5),
    isHidden: false,
    pane: "floatPane",
    enableEventPropagation: false,
    content: outerSpan
  };

  return new InfoBox(infoBoxOpts);
}

Pin.prototype._closeInfoWindow = function(event) {
  event.stopPropagation();
  this._infoWindow.close();
  this._infoWindow = null;
  this._userClosedInfoWin = true;
}

Pin.prototype._moreInfo = function() {
  this._infoCallback(this._mtnView);
}

Pin.prototype._openInfoWindow = function(){
  if (this._userClosedInfoWin) return;

  const forecast = this._forecasts.day[this._dayNum];
  const infoWindow = this._createInfoWindow(this._moreInfo.bind(this), this._closeInfoWindow.bind(this));
  infoWindow.open(this._map, this._marker);
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
