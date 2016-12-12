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

Pin.prototype._createInfoWindow = function(mtnName) {
  let outerSpan = document.creatElement("span");
  outerSpan.classList.add("mdl-chip", "mdl-chip--contact", "mdl-chip--deletable");
  outerSpan.style.backgroundColor = "white";

  let iconSpan = document.creatElement("span");
  iconSpan.classList.add("mdl-chip__contact", "mdl-color--indigo", "mdl-color-text--white");
  iconSpan.style.fontFamily = "baskerville";
  iconSpan.style.fontWeight = "bold";
  iconSpan.style.fontStyle = "italic";
  iconSpan.textContent = "i";
  outerSpan.addChild(iconSpan);

  let textSpan = document.creatElement("span");
  textSpan.classList.add("mdl-chip__text");
  textSpan.textContent = mtnName;
  outerSpan.addChild(textSpan);

  let closer = document.creatElement("span");
  closer.classList.add("mdl-chip__text");

  let icon = document.creatElement("i");
  icon.classList = "material-icons";
  icon.textContent = "cancel";
  closer.addChild(icon);
  outerSpan.addChild(closer);

  return outerSpan;
}

Pin.prototype._openInfoWindow = function(){
  if (this._userClosedInfoWin) return;
  const forecast = this._forecasts.day[this._dayNum];
  const infoBoxOpts = {
    disableAutoPan: false,
    maxWidth: 0,
    pixelOffset: new google.maps.Size(0, 0),
    zIndex: null,
    boxStyle: {
      padding: "0px 0px 0px 0px",
      width: "252px",
      height: "40px"
    },
    closeBoxURL : "",
    infoBoxClearance: new google.maps.Size(1, 1),
    isHidden: false,
    pane: "floatPane",
    enableEventPropagation: false,
    content: "<span style='background-color: white' class='mdl-chip mdl-chip--contact mdl-chip--deletable'>\
      <span style='font-family: baskerville; font-weight: bold; font-style: italic' class='mdl-chip__contact mdl-color--indigo mdl-color-text--white'>i</span>\
      <span class='mdl-chip__text'>" + this._mtnView.detail.name + "</span>\
      <a class='mdl-chip__action'><i class='material-icons'>cancel</i></a></span>"
  };
  const infoWindow = new InfoBox(infoBoxOpts);
  infoWindow.open(this._map, this._marker);
  this._map.panTo(infoWindow.getPosition());
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
