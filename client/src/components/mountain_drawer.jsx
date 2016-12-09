const React = require('react');
import { Drawer, Textfield, List, ListItem, Navigation } from 'react-mdl';


const MountainDrawer = React.createClass({

	getInitialState: function() {
		return(
			{
				searchString: "",
				searchResults: null
			}
		)
	},

	componentWillReceiveProps: function(nextProps) {
		if (nextProps.mountainViews && this.state.searchResults === null) {
			this.setState({searchResults: nextProps.mountainViews.mountains})
		}
	},

	updateSearch: function(event) {
		let input = event.target.value
    this.setState({searchString: input});
    if (this.props.mountainViews) {
    	input = input.trim().toLowerCase();
	    let list = this.props.mountainViews.mountains;
	    if (input.length > 0) {
		    list = list.filter(function(mtn) {
		      return mtn.name.toLowerCase().includes(input);
		    });
		  }
		  this.setState({searchResults: list});
    }
	},

	itemSelected: function(index) {
		this.setState({searchString: "", searchResults: this.props.mountainViews.mountains});
		document.querySelector('.mdl-js-layout').MaterialLayout.toggleDrawer();
		this.props.onSelection(this.state.searchResults[index]);
	},

	handler: function(index) {
		return function() {
			this.itemSelected(index);
		}.bind(this);
	},

	render: function() {
		console.log(this.props.mountainViews)
		let list = this.state.searchResults;
		if (list) {
		  list = list.map(function(mtn,index) {
		    return(<a key={index} style={{color: 'black', padding: '5px 15px', cursor: 'pointer'}} onClick={this.handler(index)}>{mtn.name}</a>);
		   }.bind(this));
		 }

		return(
			 <Drawer title="Munro Bagger">
			    <Textfield
            onChange={this.updateSearch}
            label="Search Munros..."
            style={{margin: '0px 10px', width: '100%'}}
            value={this.state.searchString}
          />
          <Navigation>
          	{list}
          </Navigation>
	     </Drawer>
	  )
	}
});

module.exports = MountainDrawer
