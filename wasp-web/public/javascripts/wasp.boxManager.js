(function($) {

/**
 * Handles display of box model,
 */
BoxManager = function() {};
BoxManager.prototype = {
  /**
   * binds itself to window resize event, 
   * and call resize box
   */
  init : function( id, statusData ) {
    var that = this;
    $w.utils.onResizeAndNow( function() { that.resizeBoxes() } );
  },

  resizeBoxes : function() {
    var gridSize = 300;

    // aside box
    var asideWidth = gridSize
      , windowW = $('#wrapper').width()
      , asideOverWidth = ( windowW - asideWidth ) % gridSize
      , asideAjustedWidth = asideWidth + asideOverWidth
      , contentWidth = windowW - asideAjustedWidth;

    $('#content').width( contentWidth );
    $('#aside').width( asideAjustedWidth ).fadeIn();

    // plugin box
    var contentH = $('#content').height()
      , pluginsH = gridSize
      , topH = 100
      , topOverH = ( contentH - topH ) % gridSize
      , topAjustedH = topH + topOverH
      , pluginsAjustedH = contentH - topAjustedH;

    $("#plugins").height( pluginsAjustedH );

    $("#top").height( topAjustedH );

    var messageOuterH = 35
      , overMsgH = ( topAjustedH + 20 ) % messageOuterH
      , maxRows = ( topAjustedH + 20 - overMsgH ) / messageOuterH;

    $w.messagePanel.message( "Window resized, reajusting box model.");
    $w.messagePanel.maxRows = maxRows;
  }
};

/**
 * aside accessor (service/singleton like)
 */
$.extend( wasp, {
boxManager: {
  init : function() {
    $w.boxManager = new BoxManager();
    $w.boxManager.init();
  }
}
});

})(jQuery);