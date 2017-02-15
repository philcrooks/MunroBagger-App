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

const Connection = { NONE: 0, UNKNOWN: 1 };
const connection = { type: Connection.UNKNOWN };

module.exports = {
  localStorage: localStorage,
  Connection: Connection,
  connection: connection
}