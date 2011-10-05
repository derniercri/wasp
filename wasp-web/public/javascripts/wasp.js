var wasp = {};

(function($) {

$.extend( wasp, 
{
  viewers : {},

  init : function() {
    setInterval( wasp.refresh, 3000 );
  },

  getDateStr : function() {
    var d = new Date();
    return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() +  " - " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
  },

  refresh : function() {
    $.ajax({
      url: '/refresh',
      dataType: 'json',
      success: function( data ) {
        wasp.processRefresh( data );
      },
      error: function() {
        wasp.spawnError( wasp.getDateStr() + " : Could not refresh" , "refresh" );
      }
    });
  },

  processRefresh : function( data ) {
    var workers = data['workers'];

    if ( ! workers ) {
      wasp.spawnError('Bad JSON refresh', "refreshErr");
      return;
    }

    for ( i in workers ) { // first loop is for workers
      var worker = workers[i];
      var ip = i; 

      var box = wasp.boxes.get('worker', ip)

      box.setStatus( worker['status'] );
      
      if ( worker['name'] )
        box.setTitle( worker['name'] );
      else
        box.setTitle( ip );

      if ( worker['status'] == 0 )
        continue;

      var watchers = worker['watchers'];
      for ( j in watchers ) {
        var watcher = watchers[j];

        var watcherBox = wasp.boxes.get( watcher.type, ip, watcher.name );

        watcherBox.setStatus( watcher['status'] );
        watcherBox.setTitle( watcher.name );
      }

      // TODO  : delete removed watchers in case of a daemon restart.
    }
  },

  spawnError : function( msg, errorId ) {
    var errorBox;

    var errorTmp;
    if ( errorId ) {
      errorTmp = $('#' + errorId);
    }

    if ( errorTmp && errorTmp.length > 0 ) {
      errorBox = errorTmp;  
    }
    else {
      errorBox = $('<div></div>')
        .addClass('errorBox')
        .click( function() {
          $(this).remove();
        });
      
      if ( errorId )
        errorBox.attr('id', errorId);

      $('body').prepend( errorBox );
    }

    errorBox.html( msg );
  }
});


jQuery.fn.log = function (msg , noDate) {
  if (window.console != undefined) {
    
    var dateStr = "[" + wasp.getDateStr() + "] " ;

    if ( noDate ) 
      dateStr = "";

    console.log( dateStr + "%s: %o", msg, this);
  }
  return this;
};


$(window).load(function() {
  wasp.init();
});

})(jQuery);