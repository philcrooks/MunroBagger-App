const logger = require('../utility').logger;
const timeoutDuration = 20000; // ms

const ApiRequestDispatcher = function() {
	this.queue = [];
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
	this.queue.push(request);
};

ApiRequestDispatcher.prototype._dequeue = function(request) {
	logger("Removing a request from the dispatcher queue:", request);
	for (let i = 0; i < this.queue.length; i++) {
		if (this.queue[i] === request) {
			this.queue = this.queue.slice(i, i + 1);
			break;
		}
	}
};

ApiRequestDispatcher.prototype._online = function() {
	logger("Online event received - sending", this.queue.length, "request(s)");
	while (this.queue.length > 0) {
		if (navigator.connection.type !== Connection.NONE) {
			let request = this.queue.shift();
			logger("Sending", request);
			request._stopTimeout();
			request._status = "sent";
			request._send();
		}
	}
};

ApiRequestDispatcher.prototype._onTimeout = function(request) {
	logger("Timeout - ending request", request);
	request.callback(600, null);
	this._dequeue(request);
};

ApiRequestDispatcher.prototype._onPause = function() {
	logger("Pause event - cancelling timeouts");
	// Cancel all the timeouts
	for (let i = 0; i < this.queue.length; i++) {
		if (this.queue[i].timeout) {
			this.queue[i]._stopTimeout();
		}
	}
};

ApiRequestDispatcher.prototype._onResume = function() {
	logger("resume event - restarting timeouts");
	// Restart all the timeouts
	for (let i = 0; i < this.queue.length; i++) {
		if (this.queue[i].timeout) this.queue[i]._startTimeout(timeoutDuration, this._onTimeout.bind(this));
	}
};

let dispatcher = new ApiRequestDispatcher();	// A singleton

module.exports = dispatcher;