let Mountain = require('./mountain');
let ApiRequest = require('./api_request');

const baseURL = "http://www.munrobagger.scot/";
const mountainKey = "mountains";
// const baseURL = "http://localhost:3000/";
// const baseURL = "http://192.168.1.124:3000/";

var Mountains = function(){
  this._mountains = this._retrieveFromStore();
  console.log(this._mountains);
};

Mountains.prototype.all = function(onCompleted) {
  let mountains = [];
  if (this._mountains) {
    alert("Mountains from local storage");
    mountains = this._makeMountains(this._mountains);
    onCompleted(mountains);
  }
  else {
    const url = baseURL + "munros";
    const apiRequest = new ApiRequest();
    apiRequest.makeGetRequest(url, null, function(status, receivedMtns) {
      alert("Mountains from the internet");
      this._saveToStore(receivedMtns);
      mountains = this._makeMountains(receivedMtns);
      onCompleted(mountains);
    }.bind(this))
  }
};

Mountains.prototype._makeMountains = function(receivedMtns) {
  console.log("Making mountains")
  const mtns = [];
  for (let i = 0; i < receivedMtns.length; i++) {
    let mtn = new Mountain(receivedMtns[i]);
    mtns.push(mtn);
  }
  console.log(mtns);
  return mtns;
}

Mountains.prototype._saveToStore = function(mountains) {
  if (mountains) {
    window.localStorage.setItem(mountainKey, JSON.stringify(mountains));
  }
}

Mountains.prototype._retrieveFromStore = function() {
  return JSON.parse(window.localStorage.getItem(mountainKey));
}

module.exports = Mountains;
