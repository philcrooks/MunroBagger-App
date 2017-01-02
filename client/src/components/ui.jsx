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
const getBrowserHeight = require('../utility').getBrowserHeight;
const logger = require('../utility').logger;

const oneMinute = 60 * 1000;
const oneHour = 60 * oneMinute;

const UI = React.createClass({

  getInitialState: function() {
    this.mapObj = null;
    this.mountainViews = null;
    this.updatedAt = 0;
    this.timeoutID = -1;

    let user = new User();
    return {
      dayNum:           0,
      focusMountain:    null,
      showingMountain:  false,
      action:           null,
      user:             user,
      userLoggedIn:     false,
      mountainViews:    null,
      baseDate:         null,
      shrinkTitle:      false,
      availableWidth:   getBrowserWidth(),
      availableHeight:  getBrowserHeight()
    }
  },

  logAndSetState: function(state) {
    logger("Setting UI state:", state);
    this.setState(state);
  },

  componentDidMount: function() {
    // Now that the UI exists add listeners for events that change state
    window.addEventListener("resize", this.onResize, false);
    document.addEventListener("pause", this.onPause, false);
    document.addEventListener("resume", this.onResume, false);

    // Get the mountain data
    let mtnsView = new MountainsView();
    mtnsView.all(function() {
      logger("Mountains loaded.")
      const baseDate = new Date(mtnsView.mountains[0].detail.forecasts.dataDate.split("T")[0]);
      // Allow for a change in date
      if (!this.state.baseDate || (baseDate.getTime() !== this.state.baseDate.getTime())) this.setState({baseDate: baseDate});
      this.updatedAt = Date.now();
      this.timeoutID = window.setTimeout(this.onTimeout, oneHour);
      if (this.mapObj) this.putMountainsOnMap(mtnsView);
      this.mountainViews = mtnsView;
    }.bind(this))
  },

  selectedAction(action) {
    return (action === this.state.action);
  },

  resizeNeedsRender() {
    return (this.selectedAction('search'));
  },

  updateForecasts() {
    logger("Updating the forecasts")
    this.state.mountainViews.updateForecasts(function(){
      logger("Forecasts received")
      const mtns = this.state.mountainViews.mountains;
      const baseDate = new Date(mtns[0].detail.forecasts.dataDate.split("T")[0]);
      if (baseDate.getTime() !== this.state.baseDate.getTime()) this.setState({baseDate: baseDate});
      // Allow for a change in date
      this.updatedAt = Date.now();
      // Change the forecast without changing the forecast dayNum
      this.mapObj.changeForecasts(this.state.dayNum);
    }.bind(this))
  },

  putMountainsOnMap: function(mtnsView) {
    const mtns = mtnsView.mountains;
    if (this.state.user.loggedIn) {
      // User still has a token from an earlier session
      this.state.user.getInfo(function(success, returned) {
        if (success) mtnsView.userLogin(this.state.user);
        for (let i = 0; i < mtns.length; i++) {
          this.mapObj.addPin(mtns[i], this.onMountainSelected, this.onInfoRequested, true);
        }
        this.logAndSetState({mountainViews: mtnsView, userLoggedIn: true});
      }.bind(this))
    }
    else {
      for (let i = 0; i < mtns.length; i++) {
        this.mapObj.addPin(mtns[i], this.onMountainSelected, this.onInfoRequested, false);
      }
      this.logAndSetState({mountainViews: mtnsView});
    }
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
        // logger("not successful")
        this.logAndSetState({resetEmailExists: false});
      }
      else {
        // logger("not successful")
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
  //   logger("UI: setFilterOption", this.state.filter);
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
    logger("Map loaded");
    this.mapObj = mapObj;
    
    // Now the map exists add the mountains
    if (this.mountainViews) this.putMountainsOnMap(this.mountainViews)
  },

  onForecastDaySelected: function(dayNum) {
    this.logAndSetState({dayNum: dayNum})
    this.mapObj.changeForecasts(dayNum);
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
    var action;
    if (searchExpanding)
      action = 'search';
    else
      if (this.state.action === 'search') action = null;
    this.logAndSetState({shrinkTitle: searchExpanding, action: action});
  },

  onTimeout: function() {
    this.updateForecasts();
    this.timeoutID = window.setTimeout(this.onTimeout, oneHour);
  },

  onPause: function() {
    logger("App paused");
    if (this.timeoutID >= 0) window.clearTimeout(this.timeoutID);
  },

  onResume: function() {
    logger("App resumed");
    let timeLeft = this.updatedAt + oneHour - Date.now();
    if (timeLeft < oneMinute) {
      this.updateForecasts();
      timeLeft = oneHour;
    }
    logger("Setting timeout for", timeLeft / 60000, "minutes");
    this.timeoutID = window.setTimeout(this.onTimeout, timeLeft);
  },

  onResize: function() {
    if (this.resizeNeedsRender())
      this.logAndSetState({availableWidth: getBrowserWidth(), availableHeight: getBrowserHeight()});
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

    logger("Rendering UI");
    if (this.state.action) logger("Action:", this.state.action)

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
    let availableWidth = this.state.availableWidth - 260;
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
                availableHeight={this.state.availableHeight}
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
