var utils = require('./utils.js');

var workers = [];

var get = function ( host ) {
  
  
  return workers[host];
};

exports.get = get;