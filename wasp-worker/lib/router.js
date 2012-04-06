/*!
 * Wasp
 * Copyright(c) 2011, 2012 Nectify <dev@nectify.com>
 * Apache 2.0 Licensed
 */

var utils = require("./utils");

function Router( worker ) {
  var that = this;

  this.worker = worker;
  this.routes = [];

  var settings = worker.settings;

  this.authToken = settings['authToken'];
};

Router.prototype = {
  checkAuth : function( request ) {
    return true;
  },

  set : function (route, routeName, callback) { 
    var paramsNames = [];
  
  var paramX = route.indexOf( ':' );
  
  while( paramX != -1 ) {
    
    var paramName;
    var paramY = route.indexOf('/', paramX);
    
    paramName = ( paramY != -1 ) ? route.substr( paramX + 1, paramY - paramX - 1 ) : route.substr( paramX + 1 );
    paramsNames.push(paramName);
    
    route =  route.substr( 0, paramX ) + '(\\w+)' + ( ( paramY != -1 ) ? route.substr( paramY ) : "");
    
    paramX = route.indexOf(':');
  }

  route = route.replace('\/','\\/');

  var routeRegExp = new RegExp("^" + route + "$");
  
  this.routes.push({
    route: routeRegExp,
    routeName: routeName,
    paramsNames: paramsNames, 
    callback : callback
  });

  utils.log('Route added - name: ' + routeName + ' - route pattern:' + route, module);
  
  return this;
  },


  serve : function(request, response) {
    var routes = this.routes;

    if ( ! this.checkAuth( request ) )
      terminateWith404( response );

    for ( route in routes ) {
      var matches = request.url.match( routes[route].route );
      
      if ( matches != undefined ) {
        var paramsNames = routes[route].paramsNames;
        params = {};
        
        i = 1;
        for ( param in paramsNames ) {
          params[paramsNames[param]] = matches[i];
          i++;
        }
        
        var o = {
          params: params,
          request: request,
          response: response,
          routeName : routes[route].routeName
        };

        routes[route].callback.apply(o);
        return;
      }
    }

    // if nothing matched
    utils.log('no route found for: ' + request.url, module);

    terminateWith404( response );
  },

  terminateWith404 : function( response ) {
    response.writeHeader(404, { 'Content-Type': "text/plain" }); 
    response.end("404 not found");
  }
};


/**
 * Export the constructor.
 */
exports = module.exports = Router;