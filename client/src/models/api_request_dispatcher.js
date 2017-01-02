const logger = require('../utility').logger;

const ApiRequestDispatcher = function() {
	this.queue = [];
	document.addEventListener("online", this.online.bind(this), false);
};

ApiRequestDispatcher.prototype.dispatch = function(request) {
	let connection = navigator.connection.type;
	if (connection === Connection.NONE)
		this.queue.push(request);
	else
		request.send();
	return connection !== Connection.NONE;
};

ApiRequestDispatcher.prototype.online = function() {
	logger("Online event received - sending", this.queue.length, "request(s)");
	while (this.queue.length > 0) {
		if (navigator.connection.type !== Connection.NONE) {
			let request = this.queue.shift();
			request.send();
		}
	}
};

module.exports = ApiRequestDispatcher;