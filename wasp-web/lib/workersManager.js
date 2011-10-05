var utils = require('./utils');

var workers = {};

var register = function( worker ) {
  if ( ! worker ) {
    utils.log("Undefined worker, skipping.", module );
    return; 
  }

  var ip = worker['ip'];

  if ( utils.isEmpty( ip ) ) {
    utils.log("Blank IP, skipping", module );
    return;
  }

  workers[ ip ] = worker;
};

var get = function( ip ) {
  if ( utils.isEmpty( ip ) ) {
    utils.log("Blank IP, can't return a worker" , module);
    return undefined;
  }

  var worker = workers[ ip ];

  if ( ! worker ) {
    utils.log("No worker found for IP: " + ip, module );
  }

  return worker;
}

var getAll = function() {
  return workers;
}

var length = function() {
  var length = 0;
  for ( i in workers )
    length++;

  return length;
};


exports.register = register;
exports.get = get;
exports.getAll = getAll;
exports.length = length;