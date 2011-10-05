var utils = require('./utils.js'),
  http = require('http');

AbstractWatcher = function () {
  this.commands = [];
};

AbstractWatcher.prototype = {
  type : "abstract",

  init : function() {},

  availableCommands : function () {
    return this.commands;
  },

  execute : function ( commandName, cfg ) {
    if ( typeof cfg != 'Array' )
      cfg = [ cfg ];
   
    if ( this.isCommandAvailable( commandName ) )
      this[ "_" + commandName ].apply( this,  cfg );
  },

 // watcher.execute( "info" , write );
    // interface mixin

/*
  for ( j in commands[command ].mixins ) {
      var mixin = ...[j];
      cfg  = mixin.apply( this, cfg );

    }
  mixin {
    apply : function ( baseParams ) {
      // do stuff...
    }
  }

  do-restart {
    apply : function( watcher, baseParams) {
      var writeOld = baseParams;
      
      return function(request) {
        watcher.start();

        writeOld(request);
      };
    }
  }

  sendemail {
    apply : function( watcher, baseParams) {
      var writeOld = baseParams;
      
      return function(request) {
        sendMail();

        writeOld(request);
      };
    }
  }
*/

  isCommandAvailable : function ( name ) {
    var found = false;
    for ( i in this.commands ) {
      var commandName = this.commands[ i ];

      if ( commandName == name ) {
        found = true;
        break;
      } 
    }
    
    return found;
  },

  super : function( func , args, ancestor ) {
    if ( ! func && ! args ) 
      return this.__proto__;

    if ( ! ancestor )
      ancestor = 1;

    var parent = this.__proto__;
    for (i = 0; i < ancestor; i++)
      parent = parent.__proto__;

    parent[ func ].apply( this, args );
  },

  registerCommand : function( name ) {
    var found = this.isCommandAvailable( name );

    if ( ! found )
      this.commands.push( name )
  },

  /*registerMixin : function( mixin ) {
    // sur quoi le mixin doit reagir
    var commands = mixin.commands // ex: ['info', 'start'] 
    for ( i in commands ) {
      var command...
      this.commands[ command ].mixins.push( mixin );
    }
  }*/
};