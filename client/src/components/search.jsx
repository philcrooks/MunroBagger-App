const React = require('react');
import { Textfield } from 'react-mdl';

const Search = React.createClass({

  getInitialState: function() {
		return(
			{
				searchString: "",
				searchResults: null
			}
		)
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
		this.props.onSelection(this.state.searchResults[index]);
	},

	handler: function(index) {
		return function() {
			this.itemSelected(index);
		}.bind(this);
	},

  render: function() {

  	return (
  		<Textfield
        value={this.state.searchString}
        onChange={this.updateSearch}
        label="Search"
        expandable
        expandableIcon="search"/>
  	)
	}
});

module.exports = Search;
