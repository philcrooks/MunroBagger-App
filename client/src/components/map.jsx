const React = require('react');
const ReactDOM = require('react-dom');
const MapObject = require('../views/map')
const getScript = require('../utility').getScript;
const logger = require('../utility').logger;
const mapKey = require('../keys').mapKey;

const Map = React.createClass({

	componentDidMount: function() {
		if (navigator.connection.type === Connection.NONE) {
			logger("Offline - adding listener for Google API")
			// callback when online
			document.addEventListener("online", this.loadMap, false);
		}
		else {
			this.loadMap();
		}
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		return false;
	},

	loadMap: function(){
		logger("Loading Google Maps API");
		getScript("https://maps.googleapis.com/maps/api/js?key=" + mapKey, function() {
			logger("Google Maps API loaded")
			document.removeEventListener("online", this.loadMap);
			const node = ReactDOM.findDOMNode(this.refs.map);
	  	const mapObj = new MapObject(node);
	  	this.props.mapLoaded(mapObj);
		}.bind(this));
	},

  render: function(){
  	return (
	    <div ref='map' className='map'>
	    </div>
	  )
  }
});

module.exports = Map;