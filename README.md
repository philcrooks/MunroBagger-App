#Munro Bagger App

The Munro Bagger project consists of a Rails server, a JavaScript/React website and this Cordova app. The app was created from
the [JavaScript/React website](https://github.com/siansrd/Munro_Bagger) and uses the
[Rails server](https://github.com/johneas10/MunroBagger_on_Rails) in the same way. The website was converted into an app by first replacing the UI components with [React-MDL](https://react-mdl.github.io/react-mdl/) components and then wrapping the
JavaScript/React in the [Cordova](https://cordova.apache.org/) framework. To ensure compatibility with as many versions of
Android as possible, the [Crosswalk](https://crosswalk-project.org/) plugin was used.

As well as significant changes to the UI to adopt [Material Design Lite](https://getmdl.io/components/index.html) (by using 
React-MDL), the lower layers of the code-base changed to minimise the traffic passed between client and server and to handle 
network drop-outs.

The app is currently undergoing limited beta testing via the Google Play store.

## Technologys Used

- JavaScript
- React.js
- React-MDL
- Material Design Lite
- Cordova / Crosswalk
- WebPack
- CSS
- HTML
- Google Maps API
