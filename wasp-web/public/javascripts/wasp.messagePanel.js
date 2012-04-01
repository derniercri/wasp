(function($) {

/**
 * Handles display of messages panel :
 *   - how messages are displayed
 *   - how new messages are poped and old ones deleted
 */
MessagePanel = function() {};
MessagePanel.prototype = {
  init : function( id, statusData ) {
    this.messagesList = $('#messages');
    this.maxRows = 2
  },

  /**
   * show an error message
   */
  error : function( txt ) {
    var container = $('<span></span>');
    var txtContainer = $("<span></span>");

    container.append( txtContainer );

    txtContainer.addClass("error").html( txt );

    this._push( container.html() );
  },


  /**
   * neutral & informative message
   */
  message : function( txt ) {
    this._push( txt );
  },


  /**
   * displays that a service is down :(
    */
  serviceDown : function( name, hostname ) {
    var txt = this._serviceStatusPrefixMsg( name, hostname );

    var container = $('<span></span>');
    var statusContainer = $("<span></span>");

    container.html( txt );
    container.append( statusContainer );

    statusContainer.addClass("down").html( "down" );

    this._push( container.html() );
  },


  /**
   * displays that a service is back up
   */
  serviceUp :  function( name, hostname ) {
    var txt = this._serviceStatusPrefixMsg( name, hostname );

    var container = $('<span></span>');
    var statusContainer = $("<span></span>");

    container.html( txt );
    container.append( statusContainer );

    statusContainer.addClass("up").html( "up" );

    this._push( container.html() );
  },


  _serviceStatusPrefixMsg : function( name, hostname ) {
    var txt = name;

    if ( hostname )
      txt = txt + " on  " + hostname;
    else 
      txt = "Worker: " + txt;

    txt = txt + " is  ";

    return txt;
  },


  /**
   * push a new message to the message box
   * we force to a specific size the message 
   * to avoid displaying out of the screen
   */
  _push : function( formatedTxt ) {
    var maxRows = this.maxRows;
    this._removeAfterIndex( maxRows - 1);

    var messageEl = $.mustachize('message' , {
      datetime: $w.utils.formatDate(),
      txt: formatedTxt
    });

    messageEl.hide();

    this.messagesList.prepend( messageEl );

    messageEl.fadeIn();
  },


  _removeAfterIndex : function( index ) {
    var messages = this.messagesList.find('.message');

    if ( messages.length > index ) {
      messages.each( function( i ) {
        $message = $(this);

        if ( i > index - 1  )
          $message.remove();
      })
    }
  }
};

/**
 * messagePanel accessor (service/singleton like)
 */
$.extend( wasp, {
messagePanel: {
  init : function() {
    $w.messagePanel = new MessagePanel();
    $w.messagePanel.init();
  }
}
});

})(jQuery);