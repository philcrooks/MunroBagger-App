let UserMountain = require('./user_mountain');
let ApiRequest = require('./api_request');
const logger = require('../utility').logger;

const baseURL = "http://www.munrobagger.scot/";
// const baseURL = "http://localhost:3000/"
// const baseURL = "http://192.168.1.124:3000/";
const baggedRoute = "bagged_munros";
const apiRequest = new ApiRequest();
const tokenKey = "auth_token";

const User = function() {
  this._mountains = [];
  this._jwtoken = this._retrieveToken();
  Object.defineProperty(this, "baggedList", { get: function(){ return this._mountains; } });
  Object.defineProperty(this, "hasToken", { get: function(){ return (this._jwtoken) ? true : false; } });
}

User.prototype._getMessage = function(status, request) {
  // Global messages.
  // The wording comes from the official definition of the error codes.
  let messages = {
    400: "Bad request.",
    401: "Unauthorized.",
    403: "Forbidden.",
    404: "Not found.",
    405: "Method not allowed.",
    406: "Not acceptable.",
    407: "Proxy authentication required.",
    408: "Request timeout.",
    409: "Conflict.",
    422: "Unprocessable entity.",
    429: "Too many requests.",
    431: "Request header fields too large.",
    500: "Unexpected server error.",
    501: "Not implemented.",
    502: "Bad gateway.",
    503: "Service unavailable.",
    504: "Gateway timeout.",
    505: "HTTP version not supported.",
    511: "Network authentication required.",
    598: "Network read timeout error.",
    599: "Network connect timeout error.",
    600: "No network connection, please try again later."
  };

  // This object contains messages for specific requests.
  // This contains all the explicit error responses made by the server
  let requests = {
    register: { 422: "That email address already registered." },
    login: { 401: "Unrecognised username or password." },
    logout: {},
    resetPassword: { 404: "User not recognised." },
    changePassword: {  401: "Not logged in.", 422: "Update of password failed." },
    getBagged: { 401: "Not logged in." },
    saveBagged: { 401: "Not logged in." },
    deleteBagged: { 401: "Not logged in.", 422: "Update failed." },
    updateBagged: { 401: "Not logged in." , 422: "Update failed." }
  }

  // Merge the list for the request with the global list
  // Rails will generate error messages of its own which should be caught by the global list
  for (var code in requests[request]) {
    messages[code] = requests[request][code];
  }

  // The supplied status may not have an associated message
  let message = null;
  if (status in messages) message = { status: status, message: messages[status] };
  return message;
}

User.prototype.register = function(email, password, onCompleted) {
  const url = baseURL + "users";
  const params = { user: {
    email: email,
    password: password
  } };
  return apiRequest.makePostRequest(url, params, null, true, function(status, result) {
    let success = (status === 201);
    if(success) {
      this._jwtoken = result.auth_token;
      this._saveToken(this._jwtoken);
    }
    onCompleted(success, this._getMessage(status, 'register'));
  }.bind(this));
}

User.prototype.login = function(email, password, onCompleted) {
  const url = baseURL + "sessions";
  const params = { session: {
    email: email,
    password: password
  } };
  return apiRequest.makePostRequest(url, params, null, true, function(status, result) {
    let success = (status === 201);
    if(success) {
      this._jwtoken = result.auth_token;
      this._saveToken(this._jwtoken);
    }
    onCompleted(success, this._getMessage(status, 'login'));
  }.bind(this));
}

User.prototype.logout = function(onCompleted) {
  const url = baseURL + "sessions";
  return apiRequest.makeDeleteRequest(url, null, this._jwtoken, true, function(status) {
    let success = (status === 204);
    if (success) {
      this._mountains = [];
      this._jwtoken = null;
      this._removeToken();
    }
    onCompleted(success, this._getMessage(status, 'logout'));
  }.bind(this));
}

User.prototype.resetPassword = function(email, onCompleted) {
  // logger(email)
  const url = baseURL + "users/reset";
  const params = { user: {
    email: email
  } };
  return apiRequest.makePutRequest(url, params, null, true, function(status, result) {
    let success = (status === 204);
    onCompleted(success, this._getMessage(status, 'resetPassword'));
  }.bind(this));
}

User.prototype.changePassword = function(password, onCompleted) {
  const url = baseURL + "users/update";
  const params = { user: {
    password: password
  } };
  return apiRequest.makePutRequest(url, params, this._jwtoken, true, function(status, result) {
    // logger('status', status)
    let success = (status === 200);
    onCompleted(success, this._getMessage(status, 'changePassword'));
  }.bind(this));
}

User.prototype.getInfo = function(timeout, onCompleted) {
  timeout = (timeout) ? true : false;
  const url = baseURL + baggedRoute;
  const apiRequest = new ApiRequest();
  return apiRequest.makeGetRequest(url, this._jwtoken, timeout, function(status, mountains) {
    let success = (status === 200);
    if (success) {
      for (let i = 0; i < mountains.length; i++) {
        this._mountains.push(new UserMountain(mountains[i]));
      }
    }
    onCompleted(success, this._getMessage(status, 'getBagged'));
  }.bind(this))
}

User.prototype.createUserMountain = function(mountainId) {
  let mountain = new UserMountain({ munro_id: mountainId });
  this._mountains.push(mountain);
  return mountain;
}

User.prototype.saveUserMountain = function(mountain, onCompleted) {
  if (!mountain.isDirty()) return null;
  let url = baseURL + baggedRoute;
  let forExport = mountain.export();

  // decide if a create, update or delete request is needed

  if (!mountain._originId && mountain.bagged) {
    // Mountain has not been in the database before so should be a create request
    return apiRequest.makePostRequest(url, { bagged: forExport }, this._jwtoken, true, function(status, savedMtn) {
      let success = (status === 201);
      if (success) {
        mountain._dirty = false;
        // retrieve the id for the new entry
        mountain._originId = savedMtn.id;
      }
      onCompleted(success,this._getMessage(status, 'saveBagged'));
    }.bind(this));
  }

  // If not a create request, will have to identify the resource that is being changed.
  url += "/" + mountain._originId;

  if (mountain._originId && !mountain.bagged) {
    // This mountain has been in the database so was bagged once but not now
    // This is a delete request
    return apiRequest.makeDeleteRequest(url, null, this._jwtoken, true, function(status) {
      let success = (status === 204);
      if (success) {
        mountain._dirty = false;
        mountain._originId = undefined;
      }
      onCompleted(success, this._getMessage(status, 'deleteBagged'));
    }.bind(this));
  }

  if (mountain._originId && mountain.bagged) {
    return apiRequest.makePutRequest(url, { bagged: forExport }, this._jwtoken, true, function(status) {
      let success = (status === 201);
      if (success) {
        mountain._dirty = false;
      }
      onCompleted(success, this._getMessage(status, 'updateBagged'));
    }.bind(this));
  }

  // Should never arrive here
  return null;
}

User.prototype._saveToken = function(token) {
  if (token && window.cordova) {
    // Don't save to local storage unless running in a Cordova app
    // Local storage is not secure enough for a token when running is a browser.
    // A Cordova app has sole access to storage so is more secure.
    logger("Saving token to store")
    window.localStorage.setItem(tokenKey, token);
  }
}

User.prototype._removeToken = function() {
  if (window.cordova) {
    // Don't save to local storage unless running in a Cordova app
    // Local storage is not secure enough for a token when running is a browser.
    // A Cordova app has sole access to storage so is more secure.
    logger("Removing token from store")
    window.localStorage.removeItem(tokenKey);
  }
}

User.prototype._retrieveToken = function() {
  logger("Retrieving token from store")
  return window.localStorage.getItem(tokenKey);
}

module.exports = User;
