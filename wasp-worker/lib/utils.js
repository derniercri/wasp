var sys = require("sys"),
  winston = require('winston');

var extend = function(target, object) {
  for (index in object) {
    target[index] = object[index];
  }

  return target;
};



var isEmpty = function(  str ) {
  return str == undefined || trim( str ) == '';
}


var log = function (msg, module, noDate) {
  var moduleName;

  if ( ! module ) {
    moduleName = "";
  }
  else {
    var filename = module.filename;
    var slashX = filename.lastIndexOf("/");
    var moduleName = filename.substr(slashX + 1);
  }

  var d = new Date();
    var dateStr = "[" + d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() +  " - " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "]" ;

  if ( noDate ) 
    dateStr = "";

  winston.info(dateStr + "[" + moduleName + "] " + msg.toString());

};


var size = function( object ) {
  var count = 0;

  for ( value in object ) count++;

  return count;
}


var trim = function (str) {
  var str = str.replace(/^\s\s*/, ''),
    ws = /\s/,
    i = str.length;
  while (ws.test(str.charAt(--i)));
  return str.slice(0, i + 1);
}

exports.extend = extend;
exports.isEmpty = isEmpty;
exports.log = log;
exports.size = size;
exports.trim = trim;