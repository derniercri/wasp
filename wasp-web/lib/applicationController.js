/*!
 * Wasp
 * Copyright(c) 2011, 2012 Nectify <dev@nectify.com>
 * Apache 2.0 Licensed
 */

var workersManager = require('./workersManager'),
  utils = require('./utils');

function ApplicationController(redis, pluginsManager) {
  this.redis = redis;
  this.pluginsManager = pluginsManager;
}


ApplicationController.prototype = {
  root : function( req, res ) {
    var pluginsManager = this.pluginsManager;

    pluginsManager.loadScriptsInits( function( initStack ) {
      res.render( 'index', { pluginsManager: pluginsManager, initStack: initStack });  
    });    
  },

  refresh : function( req, res ) {
    var that = this;

    var response = {};
    var syncer = 0;  

    var getLastReportId = function ( worker, watcher ) {

      var workerName = worker['name'];
      var watcherName = watcher['name'];

      that.redis.get('wasp:reports:' + that._rSafe( workerName ) + ":" + that._rSafe( watcherName ), function(err, reportId) {
        var reportId = parseInt( reportId );

        if ( reportId == undefined )  {
          syncer--;
          return;
        }

        that.redis.get('wasp:full_reports:' + reportId, function( err , fullReportRaw ) {
          var fullReport = JSON.parse( fullReportRaw );
          var status = fullReport['status'];

          watcher['last_status'] = status;

          var workerIp = worker['ip'];

          response[ workerIp ]['watchers'][ watcherName ]['status'] = status;
          response[ workerIp ]['watchers'][ watcherName ]['name'] = watcherName;
          response[ workerIp ]['watchers'][ watcherName ]['type'] = "";

          syncer--;
        });
      });
    }; 

    var workers = workersManager.getAll();

    if ( workersManager.length() == 0 ) {
      res.json(null);
      return;
    }
    
    for ( var i in workers ) {
      var worker = workers[i];
      var status = worker['status'];
      var watchers = worker['watchers'];

      response[i] = {};
      response[i]['status'] = status;

      if ( status == 0 )
        continue;

      var name = worker['name'];

      response[i]['name'] = name;
      response[i]['watchers'] = {};

      for ( var wName in watchers) {
        syncer++;
        var watcher =  watchers[wName];

        response[i]['watchers'][wName] = {};

        getLastReportId( worker, watcher );  
      }
    }

    var synchronize = function() {
      if (syncer == 0) {
        res.json( { workers: response } );
      }
      else {
        setTimeout( synchronize , 10 );
      }
    };

    synchronize();
  },


  _rSafe : function( str ) {
    return str.replace(/ /g, '_');
  }
};

/**
 * Export the constructor.
 */
exports = module.exports = ApplicationController;