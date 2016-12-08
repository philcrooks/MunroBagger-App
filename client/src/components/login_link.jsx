var React = require('react');

const LoginLink = React.createClass({

  onClickLogin: function(){
    this.props.loginLinkClicked();
  },

  onClickLogout: function(){
    this.props.logoutLinkClicked();
  },

  render: function(){

    if (!this.props.user) return (
      <div id="loginLink" className="menu-link" onClick={this.onClickLogin}>
        <h4>Login</h4>
      </div>
    )

    return (
      <div id="loginLink" className="menu-link" onClick={this.onClickLogout}>
        <h4>Logout</h4>
      </div>
    )
  }
});

module.exports = LoginLink;