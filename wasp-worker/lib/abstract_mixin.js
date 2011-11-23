var utils = require('./utils.js');

AbstractMixin = function () {
  
};

AbstractMixin.prototype = {
  type : "abstract",
  
  init : function ( commandName, next, context ) {
    this.command = commandName;
    this.nextTick = next;
    this.context = context;
  },

  execute : function(commandName, cfg) {

    if ( typeof cfg != 'Object' )
      cfg = [ cfg ];

    if ( commandName == this.command ) {
      this.perform( cfg );
    } else {
      this.nextTick.apply( this.context, [ commandName, cfg ] ); 
    }
  },
};