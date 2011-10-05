(function($) {

BaseBox = function() {};
BaseBox.prototype = {
  type : 'base',

  init : function( type, workerIp, workerName ) {
    var id = type + "-" + workerIp + "-" + workerName;

    this.container = $('<div></div>').addClass('box').attr('id', id);
    this.topbar = $('<div></div>').addClass('topbar');
    this.footer = $('<div></div>').addClass('footer');
    this.content = $('<div></div>').addClass('content');
    this.clearer1 = $('<div></div>').addClass('clearer');
    this.type = $('<div></div>').addClass('type').html( type );
    this.title = $('<div></div>').addClass('title');
    this.status = $('<div></div>').addClass('status');

    this.container
      .append( this.topbar )
      .append( this.content ) 
      .append( this.footer ); 
    
    this.status.append( this.type ) ;

    this.topbar
      .append( this.status)
      .append( this.clearer1 )
      .append( this.title );
  },

  setTitle : function( title ) {
    this.title.html( title );
  },

  setStatus : function( status ) {
    this.status
      .removeClass('up')
      .removeClass('down')
      .removeClass('unknown');

    if ( isNaN( status ) || ( status != 0 && status != 1 ) ) {
      this.status.addClass('unknow');
      this.focus();
    }
    else if ( status == 1 ) {
      this.status.addClass('up');
    }
    else {
      this.status.addClass('down');
      this.focus();
    }
    
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

  focus : function() {
    this.container.detach();

    this.container.insertAfter('#title');
  }
};

$.extend( wasp, {
boxes: {
  types : {},

  boxes: {},

  get : function( type , workerIp , watcherName ) {
    var boxes = wasp.boxes.boxes;

    if ( ! boxes[ type ] )
      boxes[type] = {};

    if ( ! boxes[ type ][ workerIp ] ) 
      boxes[ type ][ workerIp ] = {};
    
    if ( ! watcherName )
      watcherName = "worker";
    
    var box = boxes[ type ][ workerIp ][ watcherName ];

    if ( ! box ) {
      box = wasp.boxes.newBox( type );
      box.init( type, workerIp, watcherName );
      box.container.insertAfter('#title');
    }

    boxes[ type ][ workerIp ][ watcherName ] = box;

    return box;
  },

  newBox : function( type ) {
    if ( wasp.boxes.types[ type ] ) 
      return new wasp.boxes.types[ type ]();
    
    return new wasp.boxes.types['base']();
  },

  registerBoxType : function( boxType ) {
    var type = boxType.prototype.type;

    wasp.boxes.types[ type ] = boxType;
  }
}
});

wasp.boxes.registerBoxType( BaseBox );

})(jQuery);