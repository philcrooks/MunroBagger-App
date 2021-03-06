"use strict"

const React = require('react');
import { Drawer, Textfield, List, ListItem, Navigation, Checkbox } from 'react-mdl';
const logger = require('../utility').logger;

const MBDrawer = React.createClass({

	getInitialState: function() {
		return(
			{
				map: null,
				showClimbed: true,
				showUnclimbed: true,
				showSatelliteView: false
			}
		)
	},

	componentWillReceiveProps: function(nextProps) {
		if (nextProps.map && !this.state.map) this.setState({map: this.props.map});
	},

	shouldComponentUpdate: function(nextProps, nextState){
		// const drawer = document.getElementsByClassName('mdl-layout__drawer')[0];
		// const visible = drawer.classList.contains('is-visible');
    return (this.state.map != nextState.map) ||
      (this.props.userLoggedIn !== nextProps.userLoggedIn) ||
      (this.state.showClimbed !== nextState.showClimbed) ||
      (this.state.showUnclimbed !== nextState.showUnclimbed) ||
      (this.state.showSatelliteView !== nextState.showSatelliteView);
	},

	climbedChange: function(event) {
    let status = event.target.checked;
    this.setState({showClimbed: status});
    if (this.props.userLoggedIn) {
	    this.state.map.hidePins(!status, function(pin){
	    	return(pin.bagged === true);
	    });
		}
	},

	unclimbedChange: function(event) {
    let status = event.target.checked;
    this.setState({showUnclimbed: status})
    if (this.props.userLoggedIn) {
	    this.state.map.hidePins(!status, function(pin){
	    	return(pin.bagged === false);
	    });
	  }
  },

 	viewChange: function(event) {
    let status = event.target.checked;
    this.setState({showSatelliteView: status})
    this.state.map.satelliteView = status;
  },

	render: function() {

		logger("Rendering Drawer")

		return(
			 <Drawer title="Munro Bagger">
					<Checkbox
						label="Show climbed"
						checked={this.state.showClimbed}
						disabled={!this.props.userLoggedIn}
						onChange={this.climbedChange}/>
					<Checkbox
						label="Show unclimbed"
						checked={this.state.showUnclimbed}
						disabled={!this.props.userLoggedIn}
						onChange={this.unclimbedChange}/>
					<Checkbox
						label="Satellite View"
						checked={this.state.showSatelliteView}
						disabled={this.state.map === null}
						onChange={this.viewChange}/>
					<Checkbox
						label="Sync. with server"
						checked={true}
						disabled={true}
						onChange={function(){}}/>
	     </Drawer>
	  )
	}
});

module.exports = MBDrawer
