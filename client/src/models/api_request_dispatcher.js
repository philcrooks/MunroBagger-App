"use strict"

const logger = require('../utility').logger;
const network = (process.env.NODE_ENV === 'test') ? require('../stubs').network : require('../utility').network;
const timeoutDuration = 15000; // ms

const ApiRequestDispatcher = function() {
	this._queue = [];
	this._id = 0;
	if (typeof document !== "undefined") {
		// document won't exist when running tests outside a browser
		document.addEventListener("online", this._online.bind(this), false);
		document.addEventListener("pause", this._onPause.bind(this), false);
		document.addEventListener("resume", this._onResume.bind(this), false);	
	}

};

ApiRequestDispatcher.prototype.dispatch = function(request) {
	if (!network.online) {
		request._id = this._nextId();
		if (request.timeout) request._startTimeout(timeoutDuration, this._onTimeout.bind(this));
		this._enqueue(request);
	}
	else {
		request._status = "sent";
		request._send();
	}
	return request;
};

ApiRequestDispatcher.prototype._enqueue = function(request) {
	logger("Adding a request to the dispatcher queue");
	request._status = "waiting";
	this._queue.push(request);
	logger("Dispatcher queue:", this._queueToString());
};

ApiRequestDispatcher.prototype._dequeue = function(request) {
	logger("Removing a request from the dispatcher queue:", request.id);
	for (let i = 0; i < this._queue.length; i++) {
		if (this._queue[i].id === request.id) {
			this._queue.splice(i, 1);
			break;
		}
	}
	logger("Dispatcher queue:", this._queueToString());
};

ApiRequestDispatcher.prototype._online = function() {
	logger("Online event received - sending", this._queue.length, "request(s)");
	while (this._queue.length > 0) {
		if (network.online) {
			let request = this._queue.shift();
			logger("Sending request:", request.id);
			request._stopTimeout();
			request._status = "sent";
			request._send();
		}
	}
	logger("Dispatcher queue:", this._queueToString());
};

ApiRequestDispatcher.prototype._onTimeout = function(request) {
	logger("Timeout - ending request:", request.id);
	this._dequeue(request);
	request._status = "terminated";
	request.callback(600, null);
};

ApiRequestDispatcher.prototype._onPause = function() {
	logger("Pause event - cancelling timeouts");
	// Cancel all the timeouts
	for (let i = 0; i < this._queue.length; i++) {
		if (this._queue[i].timeout) {
			this._queue[i]._stopTimeout();
		}
	}
};

ApiRequestDispatcher.prototype._onResume = function() {
	logger("resume event - restarting timeouts");
	// Restart all the timeouts
	for (let i = 0; i < this._queue.length; i++) {
		if (this._queue[i].timeout) this._queue[i]._startTimeout(timeoutDuration, this._onTimeout.bind(this));
	}

	// Won't get an online event when paused so check network status
	// if (navigator.connection.type !== Connection.NONE) this._online();
};

ApiRequestDispatcher.prototype._nextId = function() {
	if (this._id === Number.MAX_SAFE_INTEGER) this._id = 0;
	this._id += 1;
	return this._id;
};

ApiRequestDispatcher.prototype._queueToString = function() {
	let string = "";
	for (let i = 0; i < this._queue.length; i++) {
		string += this._queue[i].id.toString() + ", ";
	}
	return "[" + string.substring(0, string.length - 2) + "]";
};

let dispatcher = new ApiRequestDispatcher();	// A singleton

module.exports = dispatcher;