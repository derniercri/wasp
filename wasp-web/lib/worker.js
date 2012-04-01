var utils = require('./utils.js'),
  http = require('http');

Worker = function ( cfg ) {

  this.ip = cfg['ip'];
  this.watchers = {};
  this.status = 0;
};


Worker.prototype = {
  monitor : function() {
    var that = this;

    var options = {
      ip: this.ip,
      port: 4545,
      path: '/'
    };
    
    var req = http.get( options, function( res ) {
      res.on('data', function( rawRes ) {
        that.stopTimer();
        var result = JSON.parse( rawRes );

        that.status = 1;
        that.name = result['name'];
        that.safeName = that.name.replace(' ', '_');
        that.timer = result['timer'];


        var watchers = result['watchers'];
        for (name in watchers) {
          var watcherData = watchers[name];
          watcherData.name = name;

          that.watchers[name] = watcherData;
        }

        if ( that.timer ) 
          that.resetTimer();
        else
          utils.log("Not timer specified for Worker: " + that.name + ". Avoiding it", module);

      });
    }).on('error', function( e ) {
      that.status = 0;

      that.resetTimer();
    });
  },

  resetTimer : function() {
    delete this.timerTimeout;

    this.startTimer();
  },

  startTimer : function( ) {
    var that = this;

    var timer = this.timer;

    if ( ! timer ) { // this happens if workers hasn't been discovered yet
      utils.log("Can't reach worker (ip: " +  this.ip + "), retrying in 5 sec ", module );
      timer = 5000;
    }

    
    this.timerTimeout = setTimeout(function() { 
      that.monitor();
    }, timer );
  },

  stopTimer : function() {
    delete this.timerTimeout;
  }
};


