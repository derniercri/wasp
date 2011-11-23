var utils = require('./utils.js'),
  http = require('http');

AbstractWatcher = function () {
  this.commands = [];
  this.mixins = {};
};

AbstractWatcher.prototype = {
  type : "abstract",

  init : function() {},

  availableCommands : function () {
    return this.commands;
  },

  execute : function ( commandName, cfg ) {
    if ( typeof cfg != 'Object' )
      cfg = [ cfg ];
    
    if ( this.mixins['before'] && this.mixins['before'].length ) {
      for ( var mixin in this.mixins['before'] ) {
        cfg = this.mixins['before'][mixin].apply(cfg) || cfg;
      }
    }

    if ( this.isCommandAvailable( commandName ) )
      this[ "_" + commandName ].apply( this,  cfg );

    if ( this.mixins['after'] && this.mixins['after'].length ) {
      for ( var mixin in this.mixins['after'] ) {
        this.mixins['after'][mixin].apply(cfg);
      }
    }
    
  },
  
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

  registerMixin : function( mixin ) {
    // sur quoi le mixin doit reagir
    var commands = mixin.commands; // ex: ['info', 'start'] 
    for ( var command in commands ) {

      if ( this.mixins[command] === undefined ) {
        this.mixins[command] = {};

        this.mixins[command]['before'] = [];
        this.mixins[command]['after'] = []; 
      }

      this.mixins[command][mixin.state].push( new mixinTypes[mixin.type] );

    } 
  }
};