(function($) {

$w.plugins.system = {
  init : function( settings ) {
    var systemBoxId = $w.newBox()
      , $system = $('#' + systemBoxId);

    

    setInterval( function() {
      var cpu_per = 0
        mem_per = 0;

      var systemMo = $w.monitoredObjectsManager.find(settings["ip"] + "-" + settings["name"] );

      var name = settings["ip"];
      if ( systemMo && systemMo.status() == 1 ) {
        cpu_per = Math.round( systemMo.report["cpu_per"] * 100 ) ;
        mem_per = Math.round( systemMo.report["mem_per"] );

        name = systemMo.data["hostname"];
      }

      var $systemContent = $.mustachize("system", {
        cpu : cpu_per, 
        mem: mem_per,
        name: name
      });
      $system.html( $systemContent );
    }, 1000);

  }
};

})(jQuery);