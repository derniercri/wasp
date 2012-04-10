/*!
 * Wasp
 * Copyright(c) 2011, 2012 Nectify <dev@nectify.com>
 * Apache 2.0 Licensed
 */

require('./lib/worker');

var express = require('express')
  , http = require('http')
  , consts = require("./lib/consts")
  , Logger = require('./lib/logger')
  , PluginsManager = require('./lib/pluginsManager')
  , libRedis = require('redis')
  , utils = require('./lib/utils')
  , workersManager = require('./lib/workersManager')
  , ApplicationController = require('./lib/applicationController');


function WaspWeb( options ) {
  var that = this;
  var app = this.app = express.createServer();

  var defaults = {
    "log_level" : 4,
    "port" : consts[ 'SERVER_PORT' ]
  };

  var settings = this.settings = utils.extend( defaults, options );

  $l = this.logger = new Logger( this.settings['log_level'] );

  this.redis = libRedis.createClient( settings['redis']['port'], settings['redis']['host'] );
  this.redis.on("error", function( err ) {
    $l.error("Redis error:" + err );
  });

  this.pluginsManager = new PluginsManager( this );
  this.applicationController = new ApplicationController( this.redis, this.pluginsManager );

  this.initRoutes();

  // loading any worker
  for ( var i in settings['workers'] ) {
    var workerCfg = settings['workers'][i];

    var worker = new Worker( workerCfg );
    worker.monitor();

    workersManager.register( worker );

    this.logger.log("Initialized new WASP worker - ip: " + workerCfg['ip'], module);
  }

  this.logger.log("Configuring Plugins", module);
  this.initPlugins();

  // express configuration
  this.logger.log("Configuring Express", module)
  this.initExpress();

  

  app.listen( settings["port"] );

  this.logger.log("Express is now up and listening", module);
  this.logger.log("WASP Web is now up and running", module);
}

WaspWeb.prototype = {
  /**
   * Routes should be declared here
   */
  initRoutes : function() {
    var that = this;
    
    this.app.all('/', function(req, res) { that.applicationController.root(req, res, this); } );
    this.app.all('/refresh', function(req, res) { that.applicationController.refresh(req, res, this) } );
  },

  /**
   * Init express settings
   */
  initExpress : function() {
    var that = this
      , app = this.app
      , pluginsManager = this.pluginsManager
      , sourceDirs = pluginsManager.sourceDirs
      , $l = this.logger;

    app.configure( function() {
      app.use(express.static(__dirname + '/public'));

      for ( var i in sourceDirs ) {
        var sourceDir = sourceDirs[ i ];

        $l.info("Mounting plugin source dir: " + __dirname + sourceDir + "public" , module);

        app.use( express.static( __dirname + sourceDir + 'public' ) );
      }
    });

    app.set('views', __dirname +'/views');
    app.set('view engine', 'jade');
    app.set('view options', {
      layout: false
    });
  },

  /**
   * register plugins if any
   */
  initPlugins : function() {
    var settings = this.settings
      , plugins = settings["plugins"]
      , $l = this.logger;

    for ( var i in plugins ) {
      var plugin = plugins[ i ];

      this.pluginsManager.instanciate( plugin );
    }
  }
};



/**
 * Application initialization
 */
var start = function( settings ) {
  var waspWeb = new WaspWeb( settings );
};


exports.start = start;