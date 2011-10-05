var os = require("os"),
  exec = require('child_process').exec,
  utils = require('./../lib/utils.js');

require('./../lib/abstract_watcher.js'); 

// well, this monster let us find the global cpu usage.
var cpu_usage = "eval $(awk '/^cpu /{print \"previdle=\" $5 \"; prevtotal=\" $2+$3+$4+$5 }' /proc/stat); sleep 0.4; eval $(awk '/^cpu /{print \"idle=\" $5 \"; total=\" $2+$3+$4+$5 }' /proc/stat); intervaltotal=$((total-${prevtotal:-0})); echo \"$((100*( (intervaltotal) - ($idle-${previdle:-0}) ) / (intervaltotal) ))\"";

UnixSystemWatcher = function() {
  this.type = "system";
};

UnixSystemWatcher.prototype = new AbstractWatcher();

utils.extend( UnixSystemWatcher.prototype, {
  init : function ( name, cfg ) {
    this.name = name;
    this.cfg = cfg;

    this.registerCommand("info");
  },

  _info : function ( requestHandler ) {
    exec( cpu_usage,  function ( error, stdout, stderr ) {

      var result = {
        name: "system",
        type: "process",
        status : "running",
        cpu_per: parseInt(stdout.replace( "\n", "" )),
        free_mem: Math.round( os.freemem() / ( 1024 * 1024 ) ),
        mem_per: Math.round( ( os.totalmem() - os.freemem() ) * 100 / os.totalmem() ),
        total_mem_size: Math.round( os.totalmem() / ( 1024 * 1024 ) )
      };

      requestHandler( result );

    });
  }
});


// exposing the constructor
exports = module.exports = UnixSystemWatcher;