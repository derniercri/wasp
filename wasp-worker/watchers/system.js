/*!
 * Wasp
 * Copyright(c) 2011, 2012 Nectify <dev@nectify.com>
 * Apache 2.0 Licensed
 */

var os = require("os"),
  utils = require('./../lib/utils.js');

require('./../lib/abstract_watcher.js'); 

SystemWatcher = function() {
  this.type = "system";
};

SystemWatcher.prototype = new AbstractWatcher();

utils.extend( SystemWatcher.prototype, {
  init : function ( name, cfg ) {
    this.name = name;
    this.cfg = cfg;

    this.registerCommand("info");
  },

  _info : function ( requestHandler ) {
    var result = {
      name: "system",
      type: "process",
      status : 1,
      cpu_per: os.loadavg()[0]/ os.cpus().length,
      free_mem: Math.round( os.freemem() / ( 1024 * 1024 ) ),
      mem_per: Math.round( ( os.totalmem() - os.freemem() ) * 100 / os.totalmem() ),
      total_mem_size: Math.round( os.totalmem() / ( 1024 * 1024 ) )
    };

    requestHandler( result );
  }
});


// exposing the constructor
exports = module.exports = SystemWatcher;