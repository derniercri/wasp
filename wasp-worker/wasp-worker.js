var utils = require('./lib/utils.js'),
  consts = require('./lib/consts.js'),
  http = require('http'),
  system = require('./core-watchers-lib/unix_system.js'),
  redis = require('redis'),
  router = require('./lib/router.js');

global.mixinTypes = {};

var watcherTypes = {},
  watchers = {},
  server = {},
  redisCli;

var rSafe = function( str ) {
  if ( ! str )
    return; 

  return str.replace(/ /g, '_');
};

/**
 * Register a new type of watchers
 */
exports.registerWatcherType = function( watcher ) {
  utils.log( "Registering Watcher: " + watcher , module);

  var watcherType = require( watcher );

  watcherTypes[ watcherType.prototype.type ] = watcherType;
}

exports.registerMixinType = function( mixin ) {
  utils.log( "Registering Mixin: " + mixin , module);

  var mixinType = require( mixin );

  mixinTypes[ mixinType.prototype.type ] = mixinType;
}

// Root : Return all processes in JSON
var root = function() {
  var result = {};

  result['name'] = server['name'];
  result['watchers'] = {};
  result['timer'] = undefined;
  
  for ( i in watchers ) {
    result['watchers'][i] = {};
    result['watchers'][i]['type'] = watchers[i]['type'];
    result['watchers'][i]['timer'] = watchers[i]['cfg']['timer'];

    if ( result[''] == undefined || result['timer'] < watchers[i]['cfg']['timer'] )
      result['timer'] = watchers[i]['cfg']['timer'];
  }

  this.response.writeHeader(200);
  this.response.end(JSON.stringify(result));
};

var registerCommand = function( watcherName, cmdName ) {
  router.set(
    '/' + watcherName + '/' + cmdName, watcherName + "-" + cmdName, 
    function() {
      var that = this;

      var watcher = watchers[ watcherName ];

      watcher.execute( cmdName, function ( reply ) {
        that.response.writeHeader(200);
        that.response.end(JSON.stringify( reply ));
      });
    }
  );
}


var write = function( report ){
  var that = this;

  redisCli.incr(
    consts.REDIS_PREFIX + 'reports_id', 
    function( error, reply ) {
      
      redisCli.lpush( 
        consts.REDIS_PREFIX + 'reports:' + rSafe( server['name'] ) + ':' + rSafe( report['name'] ), 
        reply
      );

      redisCli.set(
        consts.REDIS_PREFIX + 'full_reports:' + reply, 
        JSON.stringify(report)
      );

      utils.log( consts.REDIS_PREFIX + 'reports:' + rSafe( server['name'] ) + ':' + rSafe( report['name'] ) , module);
      utils.log('Reply ID:'+ reply +' > ' + JSON.stringify(report) , module);
  });
};


var startMonitor = function( watcher ) {
  setInterval(
    function() {
      watcher.execute( "info" , write );
    }, 
    watcher.cfg.timer
  );
}


exports.start = function(config){
  // start redis
  redisCli = redis.createClient( config['redis']['port'], config['redis']['host'] );
  redisCli.on("error", function (err){
    console.log("Error connecting Redis Client" + err, module);
  });
  
  // Parse watcherType
  watchersCfg = config['watchers'];
  server = config['server'];


  router.setAuthToken( config['authToken'] );

  // root route
  router.set('', 'Root', root);
  router.set('/', 'Root', root);

  // Initialize REST routes for each watcher and their associated commands
  // and also start monitoring
  for ( var name in watchersCfg ){
    var watcherCfg = watchersCfg[name],
      type = watcherCfg.type;

    if ( ! type || ! watcherTypes[type] ) {
      utils.log("Error: can't register this watcher: " + name + " because the associated watcher type hasn't been registred, see registerWatcherType()" , module);
      continue;
    }

    if ( ! watcherCfg.timer ) {
      utils.log("Error: watcher: " + name + " has no associated monitoring timer", module);
    }

    var watcher = new watcherTypes[type]();
    watcher.init(name, watcherCfg);

    for ( i in watcher.commands ) {
      registerCommand( watcher.name , watcher.commands[ i ] );
    }

    //Register mixin

    utils.log( 'Routes created for watcher:' + watcher.name , module );

    watchers[ watcher.name ] = watcher;

    startMonitor( watcher );

    utils.log( 'Monitoring started for watcher:' + watcher.name, module );

  }
};

// Starting HTTP server
server = http.createServer(router.serve);
server.listen(4545);