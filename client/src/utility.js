var mountainSearch = function(mountains, mountainId) {
  var mId = Number(mountainId);

  var binarySearch = function(first, last) {
    var mid = first + Math.floor((last - first) / 2);
    var mountain = mountains[mid];
    var numberId = Number(mountain.id);
    if (mId === numberId) return mountains[mid];
    if (first === last) return undefined;
    if (mId < numberId)
      return binarySearch(first, mid - 1);
    else
      return binarySearch(mid + 1, last);
  };

  if (mountains.length === 0) return undefined;
  return binarySearch(0, mountains.length-1);
};

var upCase = function(string){
   var splitString = string.toLowerCase().split(' ');
   for (var i = 0; i < splitString.length; i++) {
       splitString[i] = splitString[i].charAt(0).toUpperCase() + splitString[i].substring(1);
   }
   return splitString.join(' ');
};

var passwordOK = function(password) {
  if (password.length < 8) return false;
  if (!password.match(/[A-Z]/)) return false;
  if (!password.match(/\d+/)) return false;
  return true;
};

var compassBearing = function(direction) {
  const directions = { N: "North", E: "East", S: "South", W: "West" }
  if (direction.length == 1) return directions[direction]
  return direction;
};

var dayOfWeek = function(dayNum, shortForm) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  if (shortForm) return days[dayNum].substring(0, 3);
  return days[dayNum];
};

var getBrowserWidth = function(){
  if (self.innerWidth) return self.innerWidth;
  if (document.documentElement && document.documentElement.clientWidth) {
    return document.documentElement.clientWidth;
  }
  if (document.body) return document.body.clientWidth;
};

var getBrowserHeight = function(){
  var body = document.body;
  var html = document.documentElement;

  return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
};

var getScript = function(source, callback) {
  var script = document.createElement('script');
  script.async = 1;

  var prior = document.getElementsByTagName('script')[0];
  prior.parentNode.insertBefore(script, prior);

  script.onload = script.onreadystatechange = function( _, isAbort ) {
    if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
      script.onload = script.onreadystatechange = null;
      script = undefined;

      if(!isAbort) { if(callback) callback(); }
    }
  };

  script.src = source;
};

var logger = function() {
  if (true) {
    const date = new Date();
    const ms = date.getMilliseconds();
    const time = date.toTimeString().split(" ")[0] + ":" + ms;
    let args = Array.from(arguments);
    console.log.apply(null, [time].concat(args));
  }
};

module.exports = {
  mountainSearch: mountainSearch,
  upCase: upCase,
  passwordOK: passwordOK,
  compassBearing: compassBearing,
  dayOfWeek: dayOfWeek,
  getBrowserWidth: getBrowserWidth,
  getBrowserHeight: getBrowserHeight,
  getScript: getScript,
  logger: logger
}