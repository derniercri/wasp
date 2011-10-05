var exec = require('child_process').exec,
  utils = require('./../lib/utils.js');

require('./../lib/abstract_watcher.js'); 


ProcessWatcher = function() {

};

ProcessWatcher.prototype = new AbstractWatcher();


utils.extend( ProcessWatcher.prototype, {
  type : "process",

  init : function ( name, cfg ) {
    this.name = name;
    this.cfg = cfg;

    if ( cfg['startCmd'] ) {
      this.registerCommand("start");
    }

    if ( cfg['stopCmd'] ) {
      this.registerCommand("stop");
    }

    if ( cfg['startCmd'] && cfg['stopCmd'] || cfg['restartCmd']) {
      this.registerCommand("restart");
    }

    this.registerCommand("info");
  },

  _info : function ( requestHandler ) {
    var that = this,
      cfg = this.cfg;

    var reply = {
      name: this.name,
      type: "process"
    }; 
      
    var pid = "";

    if ( cfg['pidFile'] )
      pid =  '`cat '+ cfg['pidFile'] +' `';
    else
      pid = cfg['pid'];

    exec( 'ps -o "pid %cpu %mem rss" -p ' + pid + ' |sed 1d',  function ( error, stdout, stderr ) {
      if ( utils.isEmpty( stdout ) ) {
        reply.status = 0;

        requestHandler( reply );
        return;
      }

      var info = stdout.replace('\n','').split(/ +/);

      if( info[0] == '' )
        info = info.splice(1);

      utils.extend( reply, {
        pid: info[0],
        status: 1, 
        cpu_per: info[1],
        mem_per: info[2],
        mem_size: info[3]      
      });
        
      requestHandler(reply);
    });
  },

  _restart :  function() {
    var that = this,
      cfg = this.cfg;

    exec( cfg['restartCmd'] == null ? cfg['stopCmd'] + ';' + cfg['startCmd'] : cfg['restartCmd'], function(error, stdout, stderr) {
      utils.log('Restarting Process: ' + that.name);
    });
  },

  _start : function() {
    var that = this,
      cfg = that.cfg;

    exec( cfg['startCmd'], function(error, stdout, stderr){
      utils.log('Starting Process: ' + that.name);
    });
  },

  _stop : function() {
    var that = this,
      cfg = that.cfg;
      
    exec(cfg['stopCmd'], function(error, stdout, stderr){
      utils.log('Stopping Process: ' + that.name) + ' Out: ' + stdout;
    });  
  }
});


// exposing the constructor
exports = module.exports = ProcessWatcher;