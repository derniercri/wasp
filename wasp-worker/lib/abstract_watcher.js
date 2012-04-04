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
    if ( typeof cfg != 'object' )
      cfg = [ cfg ];

    if ( this.isCommandAvailable( commandName ) )
      this[ "_" + commandName ].apply( this,  cfg );  
  },

  getExecuteContext : function(commandName) {
    var array = this.mixins[commandName]['before'];
    return array[ array.length - 1 ] || this ;
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

    if( ! this.mixins[name] ) {
      this.mixins[name] = {};
      this.mixins[name]['before'] = [];
      this.mixins[name]['after'] = [];
    }

    if ( ! found )
      this.commands.push( name )
  },

  registerMixin : function( mixin, mixinName ) {
    // sur quoi le mixin doit reagir
    var commands = mixin.commands; // ex: ['info', 'start'] 
    for ( var command in commands ) {
      var commandName = commands[command];

      if( mixin.state == "before") {
        var context = this.getExecuteContext(commandName);

        var mixinObj = new mixinTypes[mixinName](commandName, this.execute, context );

        this.execute = mixinObj.execute;

        this.mixins[commandName]['before'].push( mixinObj );
      }

      utils.log( 'Registering mixin: ' + mixinName + ' at command ' + commandName , module );
    } 
  }
};