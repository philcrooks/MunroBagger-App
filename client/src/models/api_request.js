"use strict"

const logger = require('../utility').logger;
const dispatcher = require('./api_request_dispatcher');
const XMLHttpRequest = (process.env.NODE_ENV === 'test') ? require('../stubs').XMLHttpRequest : window.XMLHttpRequest;

let ApiRequest = function() {
  this._request = new XMLHttpRequest();
  this._content = null;
  this._callback = null;
  this._timeout = false;
  this._timeoutID = null;
  this._status = 'created';
  this._id = 0;

  Object.defineProperty(this, "timeout", { get: function() { return this._timeout; } });
  Object.defineProperty(this, "callback", { get: function() { return this._callback; } });
  Object.defineProperty(this, "status", { get: function() { return this._status; } });
  Object.defineProperty(this, "id", { get: function() { return this._id; } });
};

ApiRequest.prototype._makeRequest = function(httpVerb, url, expected, callback, jwtoken, content, timeout) {
  this._request.open(httpVerb, url);
  // request.withCredentials = true;
  if (jwtoken) this._request.setRequestHeader('Authorization', 'Bearer ' + jwtoken);
  if (content) this._request.setRequestHeader('Content-Type', 'application/json');
  this._request.onload = function() {
    // In the callback, 'this' is the request
    let errorStatus = (expected.indexOf(this.status) === -1);
    let content = ((this.status === 204) || errorStatus ) ? null : JSON.parse(this.responseText);
    logger(httpVerb + " request to " + url + " returned status " + this.status)
    callback(this.status, content);
  };
  if (content) this._content = JSON.stringify(content);
  this._callback = callback;
  this._timeout = timeout;
  return dispatcher.dispatch(this);
};

ApiRequest.prototype._send = function() {
  this._request.send(this._content);
};

ApiRequest.prototype._startTimeout = function(duration, callback) {
  if (this._timeout) this._timeoutID = window.setTimeout(callback, duration, this);
};

ApiRequest.prototype._stopTimeout = function() {
  if (this._timeoutID) window.clearTimeout(this._timeoutID);
  this._timeoutID = null;
};

ApiRequest.prototype.makeGetRequest = function(url, jwtoken, timeout, callback) {
  return this._makeRequest("GET", url, [200], callback, jwtoken, null, timeout)
};

ApiRequest.prototype.makePostRequest = function(url, content, jwtoken, timeout, callback) {
  return this._makeRequest("POST", url, [200, 201], callback, jwtoken, content, timeout)
};

ApiRequest.prototype.makePutRequest = function(url, content, jwtoken, timeout, callback) {
  return this._makeRequest("PUT", url, [200, 201], callback, jwtoken, content, timeout)
};

ApiRequest.prototype.makeDeleteRequest = function(url, content, jwtoken, timeout, callback) {
  return this._makeRequest("DELETE", url, [200, 201, 204], callback, jwtoken, content, timeout);
};

module.exports = ApiRequest;
