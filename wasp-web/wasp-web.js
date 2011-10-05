require('./lib/worker.js');

var express = require('express'),
  http = require('http'),
  redis = require('redis'),
  redisCli = null,
  utils = require('./lib/utils'),
  workersManager = require('./lib/workersManager'),
  applicationController = require('./lib/applicationController');

var app = express.createServer();

/**
 * routes
 */
app.all('/', applicationController.root);
app.all('/refresh', applicationController.refresh);


/**
 * Application initialization
 */
var start = function( config ) {
  //Init the redis Cli
  applicationController.redisInit(config['redis']);

  for ( var i in config['workers'] ) {
    var workerCfg = config['workers'][i];

    var worker = new Worker( workerCfg );
    worker.monitor();

    workersManager.register( worker );

    utils.log("Initialized new WASP worker - ip: " + workerCfg['ip'], module);
  }

  // express configuration
  utils.log("Configuring Express", module)

  app.configure( function() {
    app.use(express.static(__dirname + '/public'));
  });

  app.set('views', __dirname +'/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });

  app.listen(3001);

  utils.log("Express is now up and listening", module);
  utils.log("WASP Web is now up and running", module);
};


exports.start = start;