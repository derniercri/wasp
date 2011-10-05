var utils = require('./utils.js');

Watcher = function ( name ) {
  this.name = name;
  this.lastUpdate = 0;
  this.status = 0;
};


Watcher.prototype = {
  setStatus : function( status ) {
    this.status = status;
  }
}