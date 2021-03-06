const React = require('react');
import { Layout, Header, HeaderRow, HeaderTabs, Footer, FooterSection, Textfield, Menu, MenuItem, IconButton, Icon, FABButton, Tab, Content, Spinner } from 'react-mdl';
const Scotland = require('../components/map')

// const Welcome = require('../components/welcome');
const MountainDetail = require('../components/mountain_detail');
const MBDrawer = require('./mb_drawer')
const IntroSnackbar = require('../components/intro_snackbar')
const Login = require('../components/user/login');
const Registration = require('../components/user/registration');
const ResetPassword = require('../components/user/reset_password');
const ChangePassword = require('../components/user/change_password');
const About = require('../components/about');
const Search = require('../components/search');
const Forecasts = require('../components/forecasts');

const MountainsView = require('../views/mountains_view');
const User = require('../models/user');
const dayOfWeek = require('../utility').dayOfWeek;
const getBrowserWidth = require('../utility').getBrowserWidth;
const getBrowserHeight = require('../utility').getBrowserHeight;
const logger = require('../utility').logger;

const timeIncrement = 30 * 60 * 1000;

const UI = React.createClass({

  getInitialState: function() {
    this.mountainViews = null;
    this.timeoutID = -1;

    const user = new User();
    const baseDate = new Date();
    baseDate.setHours(0,0,0,0);

    return {
      mapObj:           null,
      busy:             true,
      dayNum:           0,
      focusMountain:    null,
      showingMountain:  false,
      action:           null,
      user:             user,
      userLoggedIn:     false,
      baseDate:         baseDate,
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
      logger("Mountains loaded.");
      // No point in requesting an update immediately - lower layers will have tried already so wait
      const timeout = (mtnsView.updateInterval > 0) ? mtnsView.updateInterval : timeIncrement - ((new Date().getTime() - mtnsView.nextUpdate) % timeIncrement);
      logger("Setting forecast timeout for", Math.round(timeout / 600) / 100, "minutes");
      this.timeoutID = window.setTimeout(this.onTimeout, timeout);

      const baseDate = mtnsView.forecastDates.baseDate;
      // Allow for a change in date
      if (baseDate && (baseDate.getTime() !== this.state.baseDate.getTime())) this.logAndSetState({baseDate: baseDate});
      if (this.state.mapObj) this.putMountainsOnMap(mtnsView);
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
    let timeout = 0;
    logger("Updating the forecasts")
    this.mountainViews.updateForecasts(function(updated){
      if (updated) {
        logger("Forecasts received");
        timeout = this.mountainViews.updateInterval;
        const baseDate = this.mountainViews.forecastDates.baseDate;
        // Set the baseDate even if it hasn't changed to force the UI to redraw after an update
        if (baseDate) this.logAndSetState({baseDate: baseDate}); 
        // Change the forecast without changing the forecast dayNum
        if (this.state.mapObj) this.state.mapObj.changeForecasts(this.state.dayNum);      
      }
      else {
        logger("No forecasts received");
        // It may be that the forecasts haven't changed. In that case the timeout will be > 0
        timeout = (this.mountainViews.updateInterval > 0) ? this.mountainViews.updateInterval : timeIncrement;
      }
      logger("Setting timeout for", Math.round(this.mountainViews.updateInterval / 600) / 100, "minutes");
      this.timeoutID = window.setTimeout(this.onTimeout, timeout);
    }.bind(this))
  },

  addPinsToMap: function(mountains, loggedIn) {
    for (let i = 0; i < mountains.length; i++) {
      this.state.mapObj.addPin(mountains[i], this.onMountainSelected, this.onInfoRequested, loggedIn);
    }
  },

  putMountainsOnMap: function(mtnsView) {
    const mtns = mtnsView.mountains;
    if (this.state.user.hasToken) {
      // User still has a token from an earlier session
      // Cannot come this far without a network connection - the map will not load
      let loggedIn = false;
      this.state.user.getInfo(true, function(success, returned) {
        // This call will timeout if network connection is lost
        // Timing out will let the user work with the data that has been retrieved already
        if (success) {
          mtnsView.userLogin(this.state.user);
          loggedIn = true;
        }
        this.addPinsToMap(mtns, loggedIn);
        this.logAndSetState({busy: false, userLoggedIn: loggedIn, action: "intro"});
        if (!success && (returned.status === 600)) {
          // Offline - reissue the request without a timeout - it shoiuld succeed at some point
          this.state.user.getInfo(false, function(success, returned) {
            if (success) {
              mtnsView.userLogin(this.state.user);
              this.state.mapObj.userLoggedIn(mtns);
              this.logAndSetState({userLoggedIn: true});
            }
          }.bind(this))
        }
      }.bind(this))
    }
    else {
      this.addPinsToMap(mtns, false);
      this.logAndSetState({busy: false, action: "intro"});
    }
  },

  //
  // START OF SERVER REQUEST SECTION
  // All callback functions that start with the word 'request' interact with the server
  // THe majority of server requests are performed by dialogs.
  //

  requestLogout: function(){
    this.state.user.logout(function(success) {
      if (!success) return;
      this.mountainViews.userLogout();
      this.state.mapObj.userLoggedOut();
      this.logAndSetState({userLoggedIn: false, action: null});
    }.bind(this))
  },

  //
  // START OF THE DIALOG DISPLAY SECTION
  // Functions that start 'set' and end 'Form' cause a dialog to appaer
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

  setForecastsForm: function() {
    this.logAndSetState({action: "forecasts"})
  },

  setAboutForm: function() {
    this.logAndSetState({action: "about"})
  },

  //
  // START OF THE GLOBAL EVENT HANDLERS SECTION
  // Functions starting with the word 'on' handle a user event that has impact across the UI
  //

  onLoginCompleted: function(isLoggedIn, nextAction) {
    if (isLoggedIn) {
      this.mountainViews.userLogin(this.state.user);
      this.state.mapObj.userLoggedIn(this.mountainViews.mountains);
      this.logAndSetState({userLoggedIn: true, action: nextAction});
    }
    else {
      this.logAndSetState({action: nextAction});
    }
  },

  onCompleted: function(nextAction) {
    if (!nextAction) nextAction = null;
    this.logAndSetState({action: nextAction});
  },

  onMapLoaded: function(mapObj) {
    logger("Map loaded");
    this.logAndSetState({mapObj: mapObj});
    
    // Now the map exists add the mountains
    if (this.mountainViews) this.putMountainsOnMap(this.mountainViews)
  },

  onForecastDaySelected: function(dayNum) {
    this.logAndSetState({dayNum: dayNum})
    this.state.mapObj.changeForecasts(dayNum);
  },

  onMountainSelected: function(mtnView) {
    this.state.mapObj.openInfoWindowForMountain(mtnView.pin);
    // if (this.state.showingMountain)
      this.logAndSetState({focusMountain: mtnView});
    // else
    //   this.logAndSetState({focusMountain: mtnView, action: 'snackbar'});
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
  },

  onPause: function() {
    logger("App paused");
    if (this.timeoutID >= 0) window.clearTimeout(this.timeoutID);
  },

  onResume: function() {
    logger("App resumed");
    let timeLeft = this.mountainViews.updateInterval;
    if (timeLeft <= 0) {
      this.updateForecasts();
    }
    else {
      logger("Setting timeout for", Math.round(timeLeft / 600) / 100, "minutes");
      this.timeoutID = window.setTimeout(this.onTimeout, timeLeft); 
    }
  },

  onResize: function() {
    if (this.resizeNeedsRender())
      this.logAndSetState({availableWidth: getBrowserWidth(), availableHeight: getBrowserHeight()});
  },

  //
  // START OF THE RENDER FUNCTION
  //

  render: function() {

    logger("Rendering UI");
    if (this.state.action) logger("Action:", this.state.action)

    let days = ["Today", "Tomorrow", "Day After"];
    const baseDate = this.state.baseDate;
    if (baseDate.toDateString() !== new Date().toDateString()) {
      const day = baseDate.getDay();
      days = [dayOfWeek(day, true), dayOfWeek((day+1)%7, true), dayOfWeek((day+2)%7, true)];
    }

    let spinner = null;
    if (this.state.busy) {
      spinner = <div className='spinner-container'><Spinner singleColor /></div>
    }

    let menu;
    if (this.state.userLoggedIn) {
      menu = (
        <Menu target="menu-top-right" align="right">
          <MenuItem onClick={this.requestLogout}>Logout</MenuItem>
          <MenuItem onClick={this.setSignUpForm}>Register</MenuItem>
          <MenuItem onClick={this.setChangePasswordForm}>Change Password</MenuItem>
          <MenuItem onClick={this.setForecastsForm}>Forecasts</MenuItem>
          <MenuItem onClick={this.setAboutForm}>About</MenuItem>
        </Menu>
      );
    }
    else {
      menu = (
        <Menu target="menu-top-right" align="right">
          <MenuItem onClick={this.setLoginForm}>Login</MenuItem>
          <MenuItem onClick={this.setSignUpForm}>Register</MenuItem>
          <MenuItem onClick={this.setPasswordForm}>Reset Password</MenuItem>
          <MenuItem onClick={this.setForecastsForm}>Forecasts</MenuItem>
          <MenuItem onClick={this.setAboutForm}>About</MenuItem>
        </Menu>
      );
    }

    // These width numbers are approximate
    let availableWidth = this.state.availableWidth - 260;
    let title = "Munro Bagger";
    if (this.state.shrinkTitle && availableWidth < 200) {
      title = "MB";
      availableWidth += 80;
    }

    const forecastDates = (this.mountainViews) ? this.mountainViews.forecastDates : null;

    return (
      <div>
        <Layout fixedHeader>
          <Header>
            <HeaderRow title={title}>
              <Search
                shrunkTitle={this.state.shrinkTitle}
                availableWidth={availableWidth}
                availableHeight={this.state.availableHeight}
                mountainViews={this.mountainViews}
                onSearchClicked={this.onSearchClicked}
                onSelection={this.onMountainSelected} />
              <IconButton name="more_vert" id="menu-top-right" />
              {menu}
            </HeaderRow>
            <HeaderTabs activeTab={this.state.dayNum} onChange={this.onForecastDaySelected}>
              <Tab>{days[0]}</Tab>
              <Tab>{days[1]}</Tab>
              <Tab>{days[2]}</Tab>
            </HeaderTabs>
          </Header>
          <MBDrawer
            map={this.state.mapObj}
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
            <IntroSnackbar
              willDisplay={this.selectedAction('intro')}
              onCompleted={this.onCompleted}/>
            <Login
              user={this.state.user}
              willDisplay={this.selectedAction('login')}
              onCompleted={this.onLoginCompleted} />
            <Registration
              user={this.state.user}
              willDisplay={this.selectedAction('register')}
              onCompleted={this.onCompleted} />
            <ChangePassword
              user={this.state.user}
              willDisplay={this.selectedAction('changePassword')}
              onCompleted={this.onCompleted} />
            <ResetPassword
              user={this.state.user}
              willDisplay={this.selectedAction('resetPassword')}
              onCompleted={this.onCompleted} />
            <Forecasts
              forecastDates={forecastDates}
              willDisplay={this.selectedAction('forecasts')}
              onCompleted={this.onCompleted} />
            <About
              willDisplay={this.selectedAction('about')}
              onCompleted={this.onCompleted} />
          </Content>
        </Layout>
      </div>
    )
  }
})

module.exports = UI;
