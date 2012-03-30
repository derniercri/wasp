/*!
 * Wasp
 * Copyright(c) 2011, 2012 Nectify <dev@nectify.com>
 * Apache 2.0 Licensed
 */

require('./lib/worker.js');

var express = require('express')
  , http = require('http')
  , consts = require("./lib/consts")
  , Logger = require('./lib/logger')
  , PluginsManager = require('./lib/pluginsManager')
  , redis = require('redis')
  , redisCli = null
  , utils = require('./lib/utils')
  , workersManager = require('./lib/workersManager')
  , applicationController = require('./lib/applicationController');


function WaspWeb( options ) {
  var that = this;
  var app = this.app = express.createServer();

  var defaults = {
    "log_level" : 4,
    "port" : consts[ 'SERVER_PORT' ]
  };

  var settings = this.settings = utils.extend( defaults, options );

  this.initRoutes();
  this.logger = new Logger( this.settings['log_level'] );

  // Init the redis Cli
  applicationController.redisInit(settings['redis']);

  // loading any worker
  for ( var i in settings['workers'] ) {
    var workerCfg = settings['workers'][i];

    var worker = new Worker( workerCfg );
    worker.monitor();

    workersManager.register( worker );

    this.logger.log("Initialized new WASP worker - ip: " + workerCfg['ip'], module);
  }

  // express configuration
  this.logger.log("Configuring Express", module)
  this.initExpress();

  this.logger.log("Configuring Plugins", module);
  this.initPlugins();

  app.listen( settings["port"] );

  this.logger.log("Express is now up and listening", module);
  this.logger.log("WASP Web is now up and running", module);
}

WaspWeb.prototype = {
  /**
   * Routes should be declared here
   */
  initRoutes : function() {
    this.app.all('/', applicationController.root);
    this.app.all('/refresh', applicationController.refresh);
  },

  /**
   * Init express settings
   */
  initExpress : function() {
    var app = this.app;

    app.configure( function() {
      app.use(express.static(__dirname + '/public'));
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

    this.pluginsManager = new PluginsManager( this );

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