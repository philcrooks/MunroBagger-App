// var InfoBox = require('./infobox');

function Pin (map, mtnView, loggedIn, hidden) {
  // this._id = mtnView.id;
  this._mtnView = mtnView;
  this._mountain = mtnView.detail;
  this._map = map;
  this._loggedIn = (loggedIn) ? true : false;
  this._mountSunny = (mtnView.detail.forecasts.day[0].code <= 3)
  this._marker = null;
  this._markerCallback = null;
  this._infoCallback = null;
  this._hasFocus = false;
  this._userClosedInfoWin = false;
  this._infoWindow = null;
  this._mtnView.hidden = (hidden) ? true : false;

  Object.defineProperty(this, "id", { get: function(){ return this._mtnView.id; } });
  Object.defineProperty(this, "bagged", { get: function(){ return this._mtnView.bagged; } });
  Object.defineProperty(this, "hidden", {
    get: function(){ return this._mtnView,hidden; },
    set: function(hide){
      if (hide !== this._mtnView.hidden) {
        this._mtnView.hidden = hide;
        if (hide)
          this._marker.setMap(null);
        else
          this._resetMarker();
      }
    }
  });
};

Pin.prototype.changeForecast = function(dayNum) {
  let sunnyForecast = (this._mountain.forecasts.day[dayNum].code <= 3)
  if (this._mountSunny !== sunnyForecast) {
    this._mountSunny = sunnyForecast
    this._marker.setMap(null);
    this._resetMarker();
  }
  // else {
  //   if (this._hasFocus) this._openInfoWindow();
  // }
}

Pin.prototype.changeBaggedState = function() {
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
  if (this.hidden) return;
  this._marker =  new google.maps.Marker({
    position: this._mountain.latLng,
    map: this._map,
    icon: { url: this._generateIcon(), scaledSize: new google.maps.Size(20, 23) }
  });
  if (this._hasFocus) this._openInfoWindow();
  google.maps.event.addListener(this._marker, 'click', function(){
    this._markerCallback(this._mtnView);
  }.bind(this));
}

Pin.prototype.createMarker = function(markerCallback, infoCallback) {
  this._markerCallback = markerCallback;
  this._infoCallback = infoCallback;
  this._resetMarker();
};

Pin.prototype._createInfoContent = function(infoCallback, closeCallback) {
  let outerSpan = document.createElement("span");
  outerSpan.classList.add("info-box");

  let iconSpan = document.createElement("span");
  iconSpan.classList.add("info-icon");
  iconSpan.style.cursor = 'pointer';
  iconSpan.textContent = "i";
  iconSpan.onclick = infoCallback;
  outerSpan.appendChild(iconSpan);

  let textSpan = document.createElement("span");
  textSpan.classList.add("info-text");
  textSpan.style.cursor = 'pointer';
  textSpan.textContent = this._mtnView.name;
  textSpan.onclick = infoCallback
  outerSpan.appendChild(textSpan);

  // if (closeCallback) {
  //   let closer = document.createElement("span");
  //   closer.classList.add("info-closer");
  //   closer.onclick = closeCallback;

  //   let icon = document.createElement("i");
  //   icon.classList.add("material-icons");
  //   icon.textContent = "cancel";
  //   closer.appendChild(icon);
  //   outerSpan.appendChild(closer);
  // }

  return outerSpan;
}

// Pin.prototype._createInfoWindow = function(content) {
//   const infoBoxOpts = {
//     disableAutoPan: false,
//     alignMiddle: true,
//     alignBottom: true,
//     pixelOffset: new google.maps.Size(0, -24),
//     zIndex: null,
//     boxStyle: {
//       padding: "0px"
//     },
//     closeBoxURL : "",
//     infoBoxClearance: new google.maps.Size(5, 5),
//     isHidden: false,
//     pane: "floatPane",
//     enableEventPropagation: false,
//     content: content
//   };

//   return new InfoBox(infoBoxOpts);
// }

Pin.prototype._closeInfoWindow = function(event) {
  // event.stopPropagation();
  this._infoWindow.close();
  this._infoWindow = null;
  this._userClosedInfoWin = true;
}

Pin.prototype._moreInfo = function() {
  this._infoCallback(this._mtnView);
}

Pin.prototype._openInfoWindow = function(){
  if (this._userClosedInfoWin) return;

  // const content = this._createInfoContent(this._moreInfo.bind(this), this._closeInfoWindow.bind(this));
  const content = this._createInfoContent(this._moreInfo.bind(this));
  // const infoWindow = this._createInfoWindow(content);
  const infoWindow = new google.maps.InfoWindow({
      content: content
  });
  google.maps.event.addListener(infoWindow,'closeclick',function(){
    this._userClosedInfoWin = true;
    this._infoWindow = null;
  }.bind(this));
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
    if (!this.bagged) fileName += "not-";
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
