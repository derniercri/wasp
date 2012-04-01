/*!
 * Wasp
 * Copyright(c) 2011, 2012 Nectify <dev@nectify.com>
 * Apache 2.0 Licensed
 */

var sys = require("util"),
winston = require('winston');


var extend = function(target, object) {
	for (index in object) {
		target[index] = object[index];
	}

	return target;
};

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

var isEmpty = function ( str ) {
  return ( ! str || trim( str ) == '' );
};
  
var trim = function( str ) {
  var str = str.replace(/^\s\s*/, ''),
    ws = /\s/,
    i = str.length;
  while (ws.test(str.charAt(--i)));
  return str.slice(0, i + 1);
};

exports.extend = extend;
exports.log = log;
exports.isEmpty = isEmpty;
exports.trim = trim;