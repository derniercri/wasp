/*!
 * Wasp
 * Copyright(c) 2011, 2012 Nectify <dev@nectify.com>
 * Apache 2.0 Licensed
 */

var utils = require('./lib/utils')
  , consts = require('./lib/consts')
  , http = require('http')
  , Logger = require('./lib/logger')
  , libRedis = require('redis')
  , os = require('os')
  , Router = require('./lib/router');


function WaspWorker( options ) {
  var that = this;

  var defaults = {
    "log_level" : 4,
    "port" : consts[ 'SERVER_PORT' ],
    "defaultTimer" : 30000
  };

  var settings = this.settings = utils.extend( defaults, options );

  var $l = this.logger = new Logger( this.settings['log_level'] );

  this.initRedis();
  
  this.name = settings['server']['name'];

  this.watcherTypes = {};
  this.watchers = {};

  this.server = http.createServer(function(req, res) { that.router.serve(req, res); });
  this.server.listen(4545);;

  this.initRouter();

  this.initWatchers();
};

WaspWorker.prototype = {

  /**
   * init the router
   */
  initRouter : function() {
    var that = this;
    this.router = new Router( this );

    this.router.set('', 'Root', function() { that.root( this ); } );
    this.router.set('/', 'Root', function() { that.root( this ); } );
  },


  /**
   * init redis
   */
  initRedis : function() {
    var settings = this.settings;

    this.redis = libRedis.createClient( settings['redis']['port'], settings['redis']['host'] );
    this.redis.on("error", function (err){
      $l.error("Redis error" + err, module);
    });
  },


  /**
   * init watchers
   */
  initWatchers : function() {
    var settings = this.settings
      , watchers = this.watchers
      , $l = this.logger;
    
    // Initialize REST routes for each watcher and their associated commands
    // and also start monitoring
    for ( var name in settings['watchers'] ) {
      var watcherSettings = settings['watchers'][ name ];

      var watcher = this.createWatcher( watcherSettings );

      if ( ! watcher )
          continue;

      watcher.init(name, watcherSettings);

      for ( i in watcher.commands ) {
        this.registerCommand( watcher.name , watcher.commands[ i ] );
      }

      utils.log( 'Routes created for watcher:' + watcher.name , module );

      watchers[ watcher.name ] = watcher;

      this.startMonitor( watcher );

      utils.log( 'Monitoring started for watcher:' + watcher.name, module );
    }
  },


  createWatcher : function( wSettings ) {
     var type = wSettings['type']
      , $l = this.logger;

    if ( ! type ) {
      $l.error("Watcher type is undefined. Add the \"type\" property to your watcher declaration" , module);
      return;
    }


    if ( ! wSettings["timer"] )
      wSettings["timer"] = this.settings["defaultTimer"];

    var wClass;
    try { // first try, global watchers look up
      wClass = require( "wasp-worker-plugin-" + type );
    }
    catch( e ) {
      try { // second try, local lookup (included watchers)
        wClass = require( "./watchers/" + type );
      }
      catch( wClassNotFoundException ) {
        $l.error("Watcher: \"" + type + "\" not found. Have you installed it?", module);
        return;
      }
    }

    return new wClass( wSettings );
  },


  /**
   * Register a new command
   */
  registerCommand : function( watcherName, cmdName ) {
    var that = this
      , watchers = this.watchers;

    this.router.set(
      '/' + watcherName + '/' + cmdName, watcherName + "-" + cmdName, 
      function() {
        

        var watcher = watchers[ watcherName ];

        watcher.execute( cmdName, function ( reply ) {
          that.response.writeHeader(200);
          that.response.end(JSON.stringify( reply ));
        });
      }
    );
  },


  /**
   * Called on /
   */
  root : function( params ) {
    var watchers = this.watchers
      , result = {}
      , req = params["request"]
      , res = params["response"];

    result['name'] = this['name'];
    result['watchers'] = {};
    result['timer'] = undefined;
    
    for ( i in watchers ) {
      result['watchers'][i] = {};
      result['watchers'][i]['type'] = watchers[i]['type'];
      result['watchers'][i]['timer'] = watchers[i]['cfg']['timer'];

      if ( result[''] == undefined || result['timer'] < watchers[i]['cfg']['timer'] )
        result['timer'] = watchers[i]['cfg']['timer'];
    }

    res.writeHeader(200);
    res.end(JSON.stringify(result));
  },

  /**
   * Start to monitor a watcher
   */
  startMonitor : function( watcher ) {
    var that = this;

    setInterval( 
      function() {
        watcher.execute( "info" , function( report ) { that.write( report ); } );
      }, 
      watcher.cfg.timer
    );  
  },


  /**
   * Output to redis
   */
  write : function( report ){
    var that = this
      , redis = this.redis;

    redis.incr(
      consts.REDIS_PREFIX + 'reports_id', 
      function( error, reply ) {
        
        redis.set( 
          consts.REDIS_PREFIX + 'reports:' + that._rSafe( that.name ) + ':' + that._rSafe( report['name'] ), 
          reply
        );

        redis.expire(
          consts.REDIS_PREFIX + 'reports:' + that._rSafe( that.name ) + ':' + that._rSafe( report['name'] ), 
          86400
        );

        redis.set(
          consts.REDIS_PREFIX + 'full_reports:' + reply, 
          JSON.stringify(report)
        );

        redis.expire(
          consts.REDIS_PREFIX + 'full_reports:' + reply, 
          86400
        );

        utils.log( consts.REDIS_PREFIX + 'reports:' + that._rSafe( that.name ) + ':' + that._rSafe( report['name'] ) , module);
        utils.log('Reply ID:'+ reply +' > ' + JSON.stringify(report) , module);
    });
  },

  _rSafe : function( str ) {
    if ( ! str )
      return; 

    return str.replace(/ /g, '_');
  }
};


exports.start = function( settings ) {
  var waspWorker = new WaspWorker( settings );
};
