(function($) {

$w.on('globalStatusChanged', function( args ) {
  var status = args["status"];

  $("body").removeClass("down up").addClass( status );
});

})(jQuery);