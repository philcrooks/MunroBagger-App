"use strict"

const logger = require('../utility').logger;
const dispatcher = require('./api_request_dispatcher');
const XMLHttpRequest = (process.env.NODE_ENV === 'test') ? require('../stubs').XMLHttpRequest : window.XMLHttpRequest;

let ApiRequest = function() {
  this._request = new XMLHttpRequest();
  this._options = null;
  this._content = null;
  this._timeoutID = null;
  this._status = 'created';
  this._id = 0;

  Object.defineProperty(this, "timeout", { get: function() { return this._options.timeout; } });
  Object.defineProperty(this, "callback", { get: function() { return this._options.callback; } });
  Object.defineProperty(this, "status", { get: function() { return this._status; } });
  Object.defineProperty(this, "id", { get: function() { return this._id; } });
};

ApiRequest.prototype._makeRequest = function(options) {
  // httpVerb, url, expected, callback, jwtoken, content, timeout) {
  if (options) this._options = options;

  this._request.open(this._options.verb, this._options.url);
  // request.withCredentials = true;
  if (this._options.jwt) this._request.setRequestHeader('Authorization', 'Bearer ' + this._options.jwt);
  if (this._options.content) this._request.setRequestHeader('Content-Type', 'application/json');
  this._request.onload = function() {
    // In the callback, 'this' is the request
    let errorStatus = (this._options.expected.indexOf(this.status) === -1);
    let content = ((this.status === 204) || errorStatus ) ? null : JSON.parse(this.responseText);
    logger(httpVerb + " request to " + url + " returned status " + this.status);
    callback(this.status, content);
  };
  if (this._options.content) this._content = JSON.stringify(this._options.content);
  return dispatcher.dispatch(this);
};

ApiRequest.prototype._send = function() {
  this._request.send(this._content);
};

ApiRequest.prototype._startTimeout = function(duration, callback) {
  if (this._timeout) this._timeoutID = setTimeout(callback, duration, this);
};

ApiRequest.prototype._stopTimeout = function() {
  if (this._timeoutID) clearTimeout(this._timeoutID);
  this._timeoutID = null;
};

ApiRequest.prototype.makeGetRequest = function(url, jwtoken, timeout, callback) {
  const options = {
    verb: "GET",
    url: url,
    expected: [200],
    jwt: jwtoken,
    timeout: timeout,
    callback: callback
  };
  return this._makeRequest(options);
};

ApiRequest.prototype.makePostRequest = function(url, content, jwtoken, timeout, callback) {
  const options = {
    verb: "POST",
    url: url,
    content: content,
    expected: [200, 201],
    jwt: jwtoken,
    timeout: timeout,
    callback: callback
  };
  return this._makeRequest(options);
};

ApiRequest.prototype.makePutRequest = function(url, content, jwtoken, timeout, callback) {
  const options = {
    verb: "PUT",
    url: url,
    content: content,
    expected: [200, 201],
    jwt: jwtoken,
    timeout: timeout,
    callback: callback
  };
  return this._makeRequest(options);
};

ApiRequest.prototype.makeDeleteRequest = function(url, content, jwtoken, timeout, callback) {
  const options = {
    verb: "DELETE",
    url: url,
    content: content,
    expected: [200, 204],
    jwt: jwtoken,
    timeout: timeout,
    callback: callback
  };
  return this._makeRequest(options);
};

module.exports = ApiRequest;
