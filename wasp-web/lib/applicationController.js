var redis = require('redis'),
  redisCli = null,
  workersManager = require('./workersManager'),
  utils = require('./utils');

var redisInit = function ( cfg ) {
  redisCli = redis.createClient( cfg['port'], cfg['host'] );

  redisCli.on("error", function (err) {
    utils.log("Redis Client - Connection Error " + err, module);
  });
};


var rSafe = function( str ) {
  return str.replace(/ /g, '_');
};

var root = function( req, res ) {
  res.render( 'index' );
};

var refresh = function( req, res ) {
  var response = {};
  var syncer = 0;  

  var getLastReportId = function ( worker, watcher ) {

    var workerName = worker['name'];
    var watcherName = watcher['name'];

    redisCli.lrange('wasp:reports:' + rSafe( workerName ) + ":" + rSafe( watcherName ), 0, 0, function(err, reportsId) {
      var reportId = reportsId[0];

      if ( reportId == undefined )  {
        syncer--;
        return;
      }

      redisCli.get('wasp:full_reports:' + reportId, function( err , fullReportRaw ) {
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
}
exports.redisInit = redisInit;
exports.root = root;
exports.refresh = refresh;