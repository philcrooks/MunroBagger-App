const React = require('react');
const ReactDOM = require('react-dom');
const UI = require('./containers/ui');

function onDeviceReady() {
  // Now safe to use device APIs
  ReactDOM.render(<UI />, document.getElementById('ui'));
}

window.onload = function(){
	// onDeviceReady();
	if (window.cordova)
		document.addEventListener('deviceready', onDeviceReady, false);
	else
		onDeviceReady();
}