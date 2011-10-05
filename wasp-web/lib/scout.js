var http = require('http'),
  utils = require('./utils');

var discover = function ( serverAddress, callback ) {
  var options = {
    host: serverAddress,
    port: 4545,
    path: '/'
  };

  var req = http.get( options, function( res ) {

    res.on('data', function( rawRes ){
      utils.log("Worker did reply with : " + rawRes, module);
      var result = JSON.parse( rawRes );

      callback( result );
    });

  }).on('error', function( e ) {
    console.log("Got error: " + e.message + " avoiding this worker");

    // TODO : log, retry later to reconnect, show a warning in the app...
  });
  
};

exports.discover = discover;