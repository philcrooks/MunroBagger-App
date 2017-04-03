const logger = require('../utility').logger;

const Regions = function(mountains) {
	this._regions = this._createRegions(mountains);

	this._regionNames = [];
	for (let region in this._regions) {
		this._regionNames.push(region);
	}
	this._regionNames.sort();

  Object.defineProperty(this, "length", { get: function(){ return this._regionNames.length; } });
}

Regions.prototype._createRegions = function(mountains) {
	let regions = {};
 	for (let mountain of mountains) {
		if (!regions[mountain.detail.region]) {
			regions[mountain.detail.region] = [];
		}
		regions[mountain.detail.region].push(mountain);
	}
	return regions;
}

Regions.prototype.mountainsByIndex = function(index) {
	if ((index < 0) || (index >= this._regionNames.length)) return null;
	return this._regions[this._regionNames[index]];
}

Regions.prototype.nameByIndex = function(index) {
	if ((index < 0) || (index >= this._regionNames.length)) return null;
	return this._regionNames[index];
}

Regions.prototype.mountainsByName = function(name) {
	return this._regions[name];
}

module.exports = Regions;
