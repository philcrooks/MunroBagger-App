"use strict"

const mountainSearch = function(mountains, mountainId) {
  const mId = Number(mountainId);

  const binarySearch = function(first, last) {
    const mid = first + Math.floor((last - first) / 2);
    const mountain = mountains[mid];
    const numberId = Number(mountain.id);
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

const upCase = function(string){
   let splitString = string.toLowerCase().split(' ');
   for (let i = 0; i < splitString.length; i++) {
       splitString[i] = splitString[i].charAt(0).toUpperCase() + splitString[i].substring(1);
   }
   return splitString.join(' ');
};

const passwordOK = function(password) {
  if (password.length < 8) return false;
  if (!password.match(/[A-Z]/)) return false;
  if (!password.match(/\d+/)) return false;
  return true;
};

const emailOK = function(email) {
  const filter=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
  return filter.test(email);
}

const compassBearing = function(direction) {
  const directions = { N: "North", E: "East", S: "South", W: "West" }
  if (direction.length == 1) return directions[direction]
  return direction;
};

const dayOfWeek = function(dayNum, shortForm) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  if (shortForm) return days[dayNum].substring(0, 3);
  return days[dayNum];
};

const getBrowserWidth = function(){
  if (self.innerWidth) return self.innerWidth;
  if (document.documentElement && document.documentElement.clientWidth) {
    return document.documentElement.clientWidth;
  }
  if (document.body) return document.body.clientWidth;
};

const getBrowserHeight = function(){
  const body = document.body;
  const html = document.documentElement;

  return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
};

const getScript = function(source, callback) {
  let script = document.createElement('script');
  script.async = 1;

  const prior = document.getElementsByTagName('script')[0];
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

const logger = function() {
  if (true) {
    const date = new Date();
    const ms = date.getMilliseconds();
    const time = date.toTimeString().split(" ")[0] + ":" + ms;
    let args = Array.from(arguments);
    console.log.apply(null, [time].concat(args));
  }
};

const network = {
  get online() { return(navigator.connection.type !== Connection.NONE) }
};

module.exports = {
  mountainSearch: mountainSearch,
  upCase: upCase,
  passwordOK: passwordOK,
  emailOK: emailOK,
  compassBearing: compassBearing,
  dayOfWeek: dayOfWeek,
  getBrowserWidth: getBrowserWidth,
  getBrowserHeight: getBrowserHeight,
  getScript: getScript,
  logger: logger,
  network: network
};