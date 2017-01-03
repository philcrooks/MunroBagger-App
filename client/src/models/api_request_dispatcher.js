const logger = require('../utility').logger;
const timeoutDuration = 20000; // ms

const ApiRequestDispatcher = function() {
	this._queue = [];
	document.addEventListener("online", this._online.bind(this), false);
	document.addEventListener("pause", this._onPause.bind(this), false);
  document.addEventListener("resume", this._onResume.bind(this), false);
};

ApiRequestDispatcher.prototype.dispatch = function(request) {
	if (navigator.connection.type === Connection.NONE) {
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
	logger("Dispatcher queue:", this._queue);
};

ApiRequestDispatcher.prototype._dequeue = function(request) {
	logger("Removing a request from the dispatcher queue:", request);
	for (let i = 0; i < this._queue.length; i++) {
		if (this._queue[i] === request) {
			this._queue = this._queue.slice(i, i + 1);
			break;
		}
	}
	logger("Dispatcher queue:", this._queue);
};

ApiRequestDispatcher.prototype._online = function() {
	logger("Online event received - sending", this._queue.length, "request(s)");
	while (this._queue.length > 0) {
		if (navigator.connection.type !== Connection.NONE) {
			let request = this._queue.shift();
			logger("Sending", request);
			request._stopTimeout();
			request._status = "sent";
			request._send();
		}
	}
	logger("Dispatcher queue:", this._queue);
};

ApiRequestDispatcher.prototype._onTimeout = function(request) {
	logger("Timeout - ending request", request);
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

let dispatcher = new ApiRequestDispatcher();	// A singleton

module.exports = dispatcher;