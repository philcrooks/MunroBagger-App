"use strict"

let localStorage = {
  _storage: {},

  getItem: function(sKey) {
    if(!sKey) return null;
    return this._storage[sKey];
  },

  setItem: function (sKey, sValue) {
    if(!sKey) return;
    this._storage[sKey] = sValue;
  },

  removeItem: function (sKey) {
    if(!sKey) return;
    delete this._storage[sKey];
  }
}

console.log(localStorage.getItem("key"));
localStorage.setItem("key", "value");
console.log(localStorage.getItem("key"));
localStorage.removeItem("key");
console.log(localStorage.getItem("key"));