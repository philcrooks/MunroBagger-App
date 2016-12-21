const React = require('react');
import { Textfield, IconButton } from 'react-mdl';

const Search = React.createClass({

  getInitialState: function() {
  	this.listenerAttached = false;
		return(
			{
				expanded: false,
				searchString: "",
				searchResults: null
			}
		)
  },

  componentWillReceiveProps: function(nextProps) {
  	if (nextProps.shrunkTitle && !this.props.shrunkTitle) this.setState({expanded: true});
  },

  shouldComponentUpdate: function(nextProps, nextState) {
		return (this.state.expanded !== nextState.expanded) ||
			(this.state.searchString !== nextState.searchString);
	},

  componentDidUpdate: function(prevProps, prevState) {
  	if (!this.listenerAttached) {
  		let element = document.getElementById("expandingSearchField");
  		// This will only work in Chrome which is fine for a Cordova app.
  		element.addEventListener('webkitTransitionEnd', function(event){
  			// Tell the UI to exapnd the title
  			if (event.propertyName === "max-width") {
  				if (event.target.clientWidth === 0)
  					this.props.onSearchClicked(false);
  				else
  					document.getElementById("searchField").focus();
  			}
  		}.bind(this));
  		this.listenerAttached = true;
  	}
  },

  updateSearch: function(event) {
		let input = event.target.value
    this.setState({searchString: input});
    if (this.props.mountainViews) {
    	input = input.trim().toLowerCase();
	    let list = null;
	    if (input.length > 0) {
	    	list = this.props.mountainViews.mountains;
		    list = list.filter(function(mtn) {
		      return (mtn.name.toLowerCase().includes(input) && !mtn.hidden);
		    });
		  }
		  this.setState({searchResults: list});
    }
	},

	itemSelected: function(index) {
		this.setState({searchString: "", searchResults: this.props.mountainViews.mountains});
		this.props.onSelection(this.state.searchResults[index]);
	},

	handler: function(index) {
		return function() {
			this.itemSelected(index);
		}.bind(this);
	},

	onSearchClicked: function() {
		if (this.state.expanded)
			this.setState({expanded: false});
		else
			// Tell the UI to clear some space for the search field
			this.props.onSearchClicked(true);
	},

  render: function() {
  	console.log("Rendering Search");

  	let classes = "textfield-holder";
  	if (this.state.expanded) classes += " is-expanded";

  	return (
  		<div className="search">
  		  <IconButton name="search" onClick={this.onSearchClicked}/>
  		  <div id="expandingSearchField" className={classes}>
		  		<Textfield
		        value={this.state.searchString}
		        onChange={this.updateSearch}
				    label="Search"
				    id="searchField"
					/>
				</div>
			</div>
  	)
	}
});

module.exports = Search;
