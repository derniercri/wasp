var wasp = $w = {};

(function($) {

$.extend( wasp, 
{
  /**pack
   * On page load, we delay the WASP loading to avoid the infinite page loading effect
   */
  init : function() {
    $w.messagePanel.init();
    $w.boxManager.init();
    $w.messagePanel.error("Wasp web dashboard started");

    setInterval( $w.refresh, 3000 );
  },

  /**
   * refresh dashbaord content 
   */
  refresh : function() {
    var request = $.ajax({
      url: '/refresh',
      dataType: 'json',
      timeout: 5000, // request timeout : 5s
      success: $w.refreshSuccessHandler,
      error: function(jqXhr, textStatus, errorThrown) {
        $w.messagePanel.error( "Connection error: Could not retrieve data. Cause is: " + textStatus );
      }
    });
  },


  /**
   * handle the content refresh 
   * which means should update any monitoredObject and plugins
   */
  refreshSuccessHandler : function( data ) {
    var workers = data['workers'];

    if ( ! workers ) {
      $w.messagePanel.error('Refresh error: JSON is incorrect or no worker instancied');
      return;
    }

    var mosMngr = $w.monitoredObjectsManager;

     // first loop is for workers
    for ( var ip in workers ) { 
      var worker = workers[ ip ]
        , mo = mosMngr.findOrCreate( ip, worker );
      
      var watchers = worker['watchers'];

      for ( var name in watchers ) {
        var watcher = watchers[ name ];

        watcher['hostname'] = worker['name'] ? worker['name'] : ip;

        var mo = mosMngr.findOrCreate( ip + "-" +  name, watcher );
      }

      // TODO  : delete removed watchers in case of a daemon restart.
    }
  }
});



$(window).load(function() {
  // start wasp dashboard !
  wasp.init();
});

})(jQuery);