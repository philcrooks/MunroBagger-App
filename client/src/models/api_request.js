const logger = require('../utility').logger;
const ApiRequestDispatcher = require('./api_request_dispatcher');

var dispatcher = new ApiRequestDispatcher();

let ApiRequest = function() {
  this.request = new XMLHttpRequest();
  this.content = null;
};

ApiRequest.prototype._makeRequest = function(httpVerb, url, expected, callback, jwtoken, content) {
  this.request.open(httpVerb, url);
  // request.withCredentials = true;
  if (jwtoken) this.request.setRequestHeader('Authorization', 'Bearer ' + jwtoken);
  if (content) this.request.setRequestHeader('Content-Type', 'application/json');
  this.request.onload = function() {
    // In the callback, 'this' is the request
    let errorStatus = (expected.indexOf(this.status) === -1);
    let content = ((this.status === 204) || errorStatus ) ? null : JSON.parse(this.responseText);
    logger(httpVerb + " request to " + url + " returned status " + this.status)
    callback(this.status, content);
  };
  if (content) this.content = JSON.stringify(content);
  return dispatcher.dispatch(this);
};

ApiRequest.prototype.send = function() {
  this.request.send(this.content);
};

ApiRequest.prototype.makeGetRequest = function(url, jwtoken, callback) {
  return this._makeRequest("GET", url, [200], callback, jwtoken)
};

ApiRequest.prototype.makePostRequest = function(url, content, jwtoken, callback) {
  return this._makeRequest("POST", url, [200, 201], callback, jwtoken, content)
};

ApiRequest.prototype.makePutRequest = function(url, content, jwtoken, callback) {
  return this._makeRequest("PUT", url, [200, 201], callback, jwtoken, content)
};

ApiRequest.prototype.makeDeleteRequest = function(url, content, jwtoken, callback) {
  return this._makeRequest("DELETE", url, [200, 201, 204], callback, jwtoken, content);
};

module.exports = ApiRequest;
