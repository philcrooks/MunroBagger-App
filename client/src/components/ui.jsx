const React = require('react');
import { Layout, Header, HeaderRow, HeaderTabs, Footer, FooterSection, Textfield, Menu, MenuItem, IconButton, Icon, FABButton, Tab, Content, Spinner } from 'react-mdl';
const Scotland = require('./map')

const Welcome = require('./welcome');
const MountainDetail = require('./mountain_detail');
const MBDrawer = require('./mb_drawer')
const MountainSnackbar = require('./mountain_snackbar')
const Login = require('./user/login');
const Registration = require('./user/registration');
const UserNewPassword = require('./user/user_new_password');
const UserChangePassword = require('./user/user_change_password');
const About = require('./about');
const Search = require('./search');

const MountainsView = require('../views/mountains_view');
const User = require('../models/user');
const dayOfWeek = require('../utility').dayOfWeek;
const getBrowserWidth = require('../utility').getBrowserWidth;

const UI = React.createClass({

  getInitialState: function() {

    this.mapObj = null;

    return {
      dayNum:           0,
      baseDate:         null,
      focusMountain:    null,
      showingMountain:  false,
      action:           null,
      user:             new User(),
      userLoggedIn:     false,
      mountainViews:    null,
      shrinkTitle:      false
    }
  },

  logAndSetState: function(state) {
    console.log("Setting UI state:", state);
    this.setState(state);
  },

  componentDidMount: function() {
    let mtnsView = new MountainsView();
    mtnsView.all(function() {
      let mtns = mtnsView.mountains;
      let baseDate = new Date(mtns[0].detail.forecasts.dataDate.split("T")[0]);
      this.logAndSetState({mountainViews: mtnsView, baseDate: baseDate});
      for (let i = 0; i < mtns.length; i++) {
        this.mapObj.addPin(mtns[i], this.onMountainSelected, this.onInfoRequested);
      }
    }.bind(this))
  },

  selectedAction(action) {
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
      this.logAndSetState({userLoggedIn: false, action: null});
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
      this.state.user.getInfo(function(success, returned) {
        if (success) {
          this.state.mountainViews.userLogin(this.state.user);
          this.mapObj.userLoggedIn(this.state.mountainViews.mountains);
        }
        this.logAndSetState({userLoggedIn: true});
      }.bind(this))
    }
  },

  onCompleted: function(nextAction) {
    if (!nextAction) nextAction = null;
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
    if (this.state.showingMountain)
      this.logAndSetState({focusMountain: mtnView});
    else
      this.logAndSetState({focusMountain: mtnView, action: 'snackbar'});
  },

  onInfoRequested: function(mtnView) {
    this.logAndSetState({focusMountain: mtnView, showingMountain: true, action: 'mountain'})
  },

  onInfoClosed: function() {
    this.logAndSetState({showingMountain: false, action: null})
  },

  onSearchClicked: function(searchExpanding) {
    // Only have to do this for a small screen
    this.logAndSetState({shrinkTitle: searchExpanding, action: null});
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
    if (this.state.action) console.log("Action:", this.state.action)

    let days = ["Today", "Tomorrow", "Day After"];
    const baseDate = (this.state.baseDate) ? this.state.baseDate : new Date();
    if (baseDate.toDateString() !== new Date().toDateString()) {
      const day = baseDate.getDay();
      days = [dayOfWeek(day, true), dayOfWeek((day+1)%7, true), dayOfWeek((day+2)%7, true)];
    }

    let spinner = null;
    if (!this.state.mountainViews) {
      spinner = (
        <div style={{position:'absolute', width: '32px', height: '32px', top: '50%', left: '50%', margin: '-16px 0 0 -16px'}}>
          <Spinner singleColor />
        </div>
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

    // These width numbers are approximate
    let availableWidth = getBrowserWidth() - 260;
    let title = "Munro Bagger";
    if (this.state.shrinkTitle && availableWidth < 200) {
      title = "MB";
      availableWidth += 80;
    }

    return (
      <div>
        <Layout fixedHeader>
          <Header>
            <HeaderRow title={title}>
              <Search
                shrunkTitle={this.state.shrinkTitle}
                availableWidth={availableWidth}
                mountainViews={this.state.mountainViews}
                onSearchClicked={this.onSearchClicked}
                onSelection={this.onMountainSelected} />
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
              <Tab>{days[0]}</Tab>
              <Tab>{days[1]}</Tab>
              <Tab>{days[2]}</Tab>
            </HeaderTabs>
          </Header>
          <MBDrawer
            map={this.mapObj}
            userLoggedIn={this.state.userLoggedIn} />
          <Content>
            <Scotland mapLoaded={this.onMapLoaded}/>
            {spinner}
            <MountainDetail
              willDisplay={this.selectedAction('mountain')}
              onCompleted={this.onInfoClosed}
              onSave={this.requestBaggedStatusChange}
              mountain={this.state.focusMountain}
              dayNum={this.state.dayNum}
              baseDate={baseDate}
              userLoggedIn={this.state.userLoggedIn} />
            <MountainSnackbar
              willDisplay={this.selectedAction('snackbar')}
              onCompleted={this.onCompleted}/>
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
