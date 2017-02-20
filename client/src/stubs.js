// This file is used for testing only

const localStorage = {
  _storage: {},

  getItem: function(sKey) {
    if(!sKey || !this._storage[sKey]) return null;
    return this._storage[sKey];
  },

  setItem: function (sKey, sValue) {
    if(!sKey) return;
    this._storage[sKey] = sValue;
  },

  removeItem: function (sKey) {
    if(!sKey) return;
    delete this._storage[sKey];
  },

  clear: function() {
    this._storage = {};
  }
}

const network = {
  online: true
};

const XMLHttpRequest = function() {
  // Request
  this.verb = undefined;
  this.url = undefined;
  this.onload = undefined;
  this.ontimeout = undefined;
  this.timeout = 0;
  this.headers = {};
  this.content = undefined;
  this.loseRequest = false; // Set this to prevent the request reaching the server
  this.sendCount = 0;
  // Response
  this.status = undefined;
  this.responseText = undefined;
}

XMLHttpRequest.prototype.open = function(verb, url) {
  this.verb = verb;
  this.url = url;
}

XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
  if (name) this.headers[name] = value;
}

XMLHttpRequest.prototype.send = function(content = null) {
  this.content = content;
  this.sendCount += 1;
  if (this.loseRequest) {
    this.loseRequest = false; // Don't lose the resend (if there is one)
    if ((this.timeout > 0) && (this.ontimeout)) {
      setTimeout(this.ontimeout, this.timeout);
    }
  }
  else {
    HttpServer.receive(this);
  }
}

XMLHttpRequest.prototype.willRespondWith = function(status, text) {
  this.status = status;
  this.responseText = text;
}

const HttpServer = {
  requests: null,
  responses: null,
  initialize: function() {
    this.requests = [];
    this.responses = [];
  },
  receive: function(request) {
    const respondWith = this._findResponse(request);
    if (respondWith && (respondWith.auto))
      this._makeResponse(request, respondWith);
    else
      this.requests.push(request);
  },
  respondWith: function(verb, url, response, auto) {
    this.responses.push({verb: verb, url: url, response: response, auto: auto})
  },
  respond: function() {
    for (let request of this.requests) {
      const respondWith = this._findResponse(request);
      if (respondWith) this._makeResponse(request, respondWith);
    }
  },
  _findResponse: function(request) {
    return this.responses.find(function(item) {
      return ((item.verb === request.verb) && (item.url === request.url))
    });
  },
  _makeResponse: function(request, respondWith) {
    request.status = respondWith.response[0];
    if (respondWith.response[1]) request.responseText = respondWith.response[1];
    if (request.onload) request.onload();
  }
}

module.exports = {
  localStorage: localStorage,
  network: network,
  XMLHttpRequest: XMLHttpRequest,
  HttpServer: HttpServer
}