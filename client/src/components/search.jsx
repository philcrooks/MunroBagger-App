const React = require('react');
import { Textfield, IconButton, List, ListItem, ListItemContent } from 'react-mdl';

const Search = React.createClass({

  getInitialState: function() {
  	this.listenersAttached = false;
		return(
			{
				expanded: false,
				searchString: "",
				searchResults: []
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
  	if (!this.listenersAttached) {
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
  		element = document.getElementById("searchField");
  		element.addEventListener('blur', function(event) {
  			this.setState({expanded: false});
  		}.bind(this));
  		// element = document.getElementById("searchResults");
  		// element.addEventListener('touchstart', function(event){
				// document.getElementById("searchField").blur();
  		// }.bind(this));
  		// element.addEventListener('touchend', function(event){
				// document.getElementById("searchField").focus();
  		// }.bind(this));
  		this.listenersAttached = true;
  	}
  },

  updateSearch: function(event) {
		let input = event.target.value
    this.setState({searchString: input});
    if (this.props.mountainViews) {
    	input = input.trim().toLowerCase();
    	console.log(input);
	    let list = [];
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
		this.setState({searchString: "", searchResults: [], expanded: false});
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

  	let list = this.state.searchResults;
  	let taggedList = null;
  	if (list.length > 0) {
	  	list = list.map(function(item, index){
	  		return(
	  			<ListItem key={index} onMouseDown={this.handler(index)}><ListItemContent>{item.name}</ListItemContent></ListItem>
	  		)
	  	}.bind(this));
	  	taggedList = <List>{list}</List>;
	  }

  	let searchClasses = "textfield-holder";
  	if (this.state.expanded) searchClasses += " is-expanded";
  	let resultClasses = "search-results";
  	if (this.state.expanded && taggedList) resultClasses += " is-visible";

  	return (
  		<div className="search">
  		  <IconButton name="search" onClick={this.onSearchClicked}/>
  		  <div id="expandingSearchField" className={searchClasses}>
		  		<Textfield
		        value={this.state.searchString}
		        onChange={this.updateSearch}
				    label="Search"
				    id="searchField"
					/>
				</div>
				<div id="searchResults" className={resultClasses}>
					{taggedList}
				</div>
			</div>
  	)
	}
});

module.exports = Search;
