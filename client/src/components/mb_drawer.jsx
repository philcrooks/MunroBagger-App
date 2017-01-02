const React = require('react');
import { Drawer, Textfield, List, ListItem, Navigation, Checkbox } from 'react-mdl';
const logger = require('../utility').logger;

const MBDrawer = React.createClass({

	getInitialState: function() {
		return(
			{
				map: null,
				showClimbed: true,
				showUnclimbed: true
			}
		)
	},

	componentWillReceiveProps: function(nextProps) {
		if (nextProps.map && !this.state.map) this.setState({map: this.props.map});
	},

	shouldComponentUpdate: function(nextProps, nextState){
    return (this.state.map != nextState.map) ||
      (this.props.userLoggedIn !== nextProps.userLoggedIn) ||
      (this.state.showClimbed !== nextState.showClimbed) ||
      (this.state.showUnclimbed !== nextState.showUnclimbed);
    const drawer = document.getElementsByClassName('mdl-layout__drawer')[0];
  	return(drawer.classList.contains('is-visible'));
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
						label="Sync. with server"
						checked={true}
						disabled={true}
						onChange={function(){}}/>
	     </Drawer>
	  )
	}
});

module.exports = MBDrawer
