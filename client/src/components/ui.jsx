const React = require('react');
import { Layout, Header, HeaderRow, HeaderTabs, Footer, FooterSection, Textfield, Menu, MenuItem, IconButton, Icon, FABButton, Tab, Content } from 'react-mdl';
const Scotland = require('./map')

const Filter = require('./filter');
const Welcome = require('./welcome');
const MountainDetail = require('./mountain_detail');
const MountainDrawer = require('./mountain_drawer')
const Login = require('./user/login');
const Registration = require('./user/registration');
const UserNewPassword = require('./user/user_new_password');
const UserChangePassword = require('./user/user_change_password');
const About = require('./about');

const MountainsView = require('../views/mountains_view');
const User = require('../models/user');

const UI = React.createClass({

  getInitialState: function() {

    this.mapObj = null;

    return {
      dayNum:           0,
      focusMountain:    null,
      focusMountBagged: null,
      checkboxDisabled: false,
      action:           null,
      user:             new User(),
      userLoggedIn:     false,
      mountainViews:    null,
      resetEmailExists:  true,
      signupEmailExists: false
    }
  },

  logAndSetState: function(state) {
    console.log("Setting UI state:", state);
    this.setState(state);
  },

  componentDidMount: function() {
    let mtnsView = new MountainsView();
    mtnsView.all(function() {
      this.logAndSetState({mountainViews: mtnsView});
      let mtns = mtnsView.mountains;
      for (let i = 0; i < mtns.length; i++) {
        this.mapObj.addPin(mtns[i], this.onMountainSelected, this.onInfoRequested);
      }
    }.bind(this))
  },

  selectedAction(action) {
    console.log("comparing", action, "with", this.state.action )
    return (action === this.state.action);
  },

  //
  // START OF SERVER REQUEST SECTION
  // All callback functions that start with the word 'request' interact with the server
  //

  requestLogout: function(){
    this.state.user.logout(function(success) {
      if (!success) return;
      this.state.mountainViews.userLogout();
      this.mapObj.userLoggedOut();
      this.logAndSetState({userLoggedIn: false});
      this.logAndSetState({action: null});
    }.bind(this))
  },

  requestPasswordReset: function(email){
    this.state.user.resetPassword(email, function(success){
      if (!success) {
        // console.log("not successful")
        this.logAndSetState({resetEmailExists: false});
      }
      else {
        // console.log("not successful")
        this.logAndSetState({action: null})
      }
    }.bind(this))
    // TODO add if not success
  },

  requestChangePassword: function(password){
    this.state.user.changePassword(password, function(success){
      if (success) this.logAndSetState({action: null})
    }.bind(this))
  },

  requestBaggedStatusChange: function(status) {
    this.logAndSetState({focusMountBagged: status, checkboxDisabled: true})
    this.state.focusMountain.backup();
    this.state.focusMountain.bagged = status;
    this.state.focusMountain.pin.changeBaggedState(status);
    this.state.focusMountain.save(function(success) {
      if (!success) status = !status;
      this.logAndSetState({checkboxDisabled: false, focusMountBagged: status}, function() {
        console.log("Change state enable:", this.state.checkboxDisabled)
      })

      if (!success) {
        // There was an error saving the data
        this.state.focusMountain.pin.changeBaggedState(!status);
        this.state.focusMountain.restore();
      }
    }.bind(this));
  },

  setDate: function() {
    // Do something here with date
  },

  //
  // START OF THE FORM DISPLAY SECTION
  // Functions that start 'set' and end 'Form' change the form displayed in the Infobox
  // The effect of these event-handlers is local to InfoBox
  //

  setLoginForm: function() {
    this.logAndSetState({action: "login"})
  },

  setSignUpForm: function() {
    this.logAndSetState({action: "register"})
  },

  setChangePasswordForm: function() {
    this.logAndSetState({action: "changePassword"})
  },

  setPasswordForm: function() {
    this.logAndSetState({action: "resetPassword"})
  },

  setAboutForm: function() {
    this.logAndSetState({action: "about"})
  },

  // setFilterOption: function(value) {
  //   this.logAndSetState({filter: value});
  //   console.log("UI: setFilterOption", this.state.filter);
  // },

  //
  // START OF THE GLOBAL EVENT HANDLERS SECTION
  // Functions starting with the word 'on' handle a user event that has impact across the UI
  //

  onLoginCompleted: function(isLoggedIn, nextAction) {
    this.logAndSetState({action: nextAction});
    if (isLoggedIn) {
      this.logAndSetState({userLoggedIn: true});
      this.state.user.getInfo(function() {
        this.state.mountainViews.userLogin(this.state.user);
        this.mapObj.userLoggedIn(this.state.mountainViews.mountains)
      }.bind(this))
    }
  },

  onCompleted: function(nextAction) {
    this.logAndSetState({action: nextAction});
  },

  onMapLoaded: function(mapObj) {
    this.mapObj = mapObj;
  },

  onForecastDaySelected: function(dayNum) {
    this.logAndSetState({dayNum: dayNum})
    this.mapObj.changeForecast(dayNum);
  },

  onMountainSelected: function(mtnView) {
    this.mapObj.openInfoWindowForMountain(mtnView.pin);
    if (this.state.focusMountain) this.onInfoRequested(mtnView);
  },

  onInfoRequested: function(mtnView) {
    this.logAndSetState({focusMountain: mtnView})
  },

  onInfoClosed: function() {
    this.logAndSetState({focusMountain: null})
  },

  //
  // START OF THE INFOBOX COMPONENT SECTION
  // The InfoBox is a container that will hold the componenet returned by infoBoxComponents()
  // this.state.infoBoxStatus is used to determine which component should be displayed
  //

  dialogs: function(action) {
    let choices = {
      password:
        <UserNewPassword
          loginClicked={this.setLoginForm}
          signUpClicked={this.setSignUpForm}
          passwordReset={this.requestPasswordReset}
          resetEmailExists={this.state.resetEmailExists}/>,
      changePassword:
        <UserChangePassword submitChangePassword={this.requestChangePassword}/>,
      changePasswordSuccess:
        <h4>Your password was changed successfully</h4>,
      contactUs:
        <About/>,
      welcome:
        <Welcome signUpClicked={this.setSignUpForm}/>,
    }
    return choices[action];
  },

  render: function() {

    console.log("Rendering UI");

    let mountain = null;
    if (this.state.focusMountain) {
      mountain = (
        <MountainDetail
          onCompleted={this.onInfoClosed}
          focusMount={this.state.focusMountain}
          dayNum={this.state.dayNum}
          bagged={this.requestBaggedStatusChange}
          disabled={this.state.checkboxDisabled}
          date={this.setDate}
          userLoggedIn={this.state.userLoggedIn} />
      )
    }

    var enabledIn, enabledOut, login;
    if (this.state.userLoggedIn) {
      enabledIn = {}
      enabledOut = {'disabled': 'disabled'}
      login = <MenuItem onClick={this.requestLogout}>Logout</MenuItem>
    }
    else {
      enabledOut = {}
      enabledIn = {'disabled': 'disabled'}
      login = <MenuItem onClick={this.setLoginForm}>Login</MenuItem>
    }
    return (
      <div>
        <Layout fixedHeader fixedDrawer>
          <Header scroll>
            <HeaderRow title="Munro Bagger">
              <IconButton name="more_vert" id="menu-top-right" />
              <Menu target="menu-top-right" align="right">
                  {login}
                  <MenuItem onClick={this.setSignUpForm} {...enabledOut}>Register</MenuItem>
                  <MenuItem onClick={this.setChangePasswordForm} {...enabledIn}>Change Password</MenuItem>
                  <MenuItem onClick={this.setPasswordForm} {...enabledOut}>Reset Password</MenuItem>
                  <MenuItem onClick={this.setAboutForm}>About</MenuItem>
              </Menu>
            </HeaderRow>
            <HeaderTabs activeTab={this.state.dayNum} onChange={this.onForecastDaySelected}>
              <Tab>Today</Tab>
              <Tab>Tomorrow</Tab>
              <Tab>Day After</Tab>
            </HeaderTabs>
          </Header>
          <MountainDrawer
            mountainViews={this.state.mountainViews}
            onSelection={this.onMountainSelected} />
          <Content>
            <Scotland mapLoaded={this.onMapLoaded}/>
            {mountain}
            <Login
              user={this.state.user}
              willDisplay={this.selectedAction('login')}
              onCompleted={this.onLoginCompleted} />
            <Registration
              user={this.state.user}
              willDisplay={this.selectedAction('register')}
              onCompleted={this.onCompleted} />
          </Content>
        </Layout>
      </div>
    )
  }
})

module.exports = UI;
