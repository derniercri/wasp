var exec = require('child_process').exec,
  http = require('http'),
  utils = require('./../lib/utils.js');

require('./../lib/abstract_watcher.js'); 


HttpWatcher = function() {

};

HttpWatcher.prototype = new AbstractWatcher();


utils.extend( HttpWatcher.prototype, {
  type : "http",
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
      type: "http"
    };

    var options = {
      host: cfg.host,
      port: cfg.port,
      path: cfg.path
    };

    var req = http.get( options, function( res ) {
      res.on('data', function( rawRes ){
        reply.status = 1;
        requestHandler(reply);
      });

    }).on('close', function( e ) {
      if ( e === 'timeout' || e === 'aborted' ) {
        reply.status = 0;
        requestHandler(reply);
      }
    })
    .on('error', function( e ){
      reply.status = 0;
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

exports = module.exports = HttpWatcher;