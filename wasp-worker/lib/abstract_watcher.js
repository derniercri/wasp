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
    
    if ( this.mixins[commandName] && this.mixins[commandName]['before'] ) {
      for ( var mixin in this.mixins[commandName]['before'] ) {
        cfg = this.mixins[commandName]['before'][mixin].perform(cfg) || cfg;
      }
    }

    if ( this.isCommandAvailable( commandName ) )
      this[ "_" + commandName ].apply( this,  cfg );

    /*if ( this.mixins['after'] ) {
      for ( var mixin in this.mixins['after'] ) {
        this.mixins['after'][mixin].apply(cfg);
      }
    }*/
    
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

  registerMixin : function( mixin, mixinName ) {
    // sur quoi le mixin doit reagir
    var commands = mixin.commands; // ex: ['info', 'start'] 
    for ( var command in commands ) {
      var commandName = commands[command];

      if ( this.mixins[commandName] === undefined ) {
        this.mixins[commandName] = {};

        this.mixins[commandName]['before'] = [];
        this.mixins[commandName]['after'] = []; 
      }
    
      var mixinObj = new mixinTypes[mixinName]();
      this.mixins[commandName][mixin.state].push( mixinObj );

      utils.log( 'Registering mixin: ' + mixinName + ' at command ' + commandName , module );
    } 
  }
};