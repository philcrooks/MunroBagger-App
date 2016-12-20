const React = require('react');
import { Drawer, Textfield, List, ListItem, Navigation, Checkbox } from 'react-mdl';


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
    if (this.state.map != nextState.map) return true;
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

		console.log("Rendering Drawer")

		return(
			 <Drawer title="Munro Bagger">
					<Checkbox label="Show climbed" checked={this.state.showClimbed} onChange={this.climbedChange}/>
					<Checkbox label="Show unclimbed" checked={this.state.showUnclimbed} onChange={this.unclimbedChange}/>
	     </Drawer>
	  )
	}
});

module.exports = MBDrawer
