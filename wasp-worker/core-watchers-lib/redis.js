var utils = require('../lib/utils.js'),
  redis = require('redis'),
  os = require("os"),
  exec = require('child_process').exec;

require('./process.js'); 



RedisWatcher = function() {
};

RedisWatcher.prototype = new ProcessWatcher();


utils.extend( RedisWatcher.prototype, {
  type : "redis",

  init : function ( name, cfg ) {
    this.name = name;
    this.cfg = cfg;

    this.super( "init" , [ name , cfg ]);
    this.registerCommand( "info" );
  },
  
  _info : function( requestHandler ) {
    var that = this,
      cfg = this.cfg;

    var reply = {
      name: this.name,
      type: this.type
    };

    var redisClient = redis.createClient();
    redisClient.on('error', function() {
      utils.extend( reply, {
        status: 0
      });

      requestHandler( reply );
      return;
    });

    redisClient.on("ready", function () {
      utils.extend(reply, {
        pid: redisClient.server_info.process_id,
        status: 1,
        cpu_per: redisClient.server_info.used_cpu_sys,
        mem_per: Math.round( ( redisClient.server_info.used_memory * 100 / os.totalmem() ) * 100 ) / 100 ,
        mem_size: redisClient.server_info.used_memory / 1000 // mem in Kbyes
      });

      redisClient.quit();

      requestHandler( reply );
    });

  }

});

// exposing the constructor
exports = module.exports = RedisWatcher;