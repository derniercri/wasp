(function($) {

$.extend( wasp, {
utils : {
  monthsName : ["Jan", "Fev", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

  /**
   * wasp classical date formating, e.g. 12:34 - 17 Mar. 12
   */
  formatDate : function( d ) {
    if ( ! d )
      d = new Date();

    var minutesAjusted = (d.getMinutes() + "").length == 1 ? "0" + d.getMinutes() : d.getMinutes();

    return  d.getHours() + ":" + minutesAjusted + " - " + d.getDate() + " " + $w.utils.monthsName[ d.getMonth() ] + ". " + d.getFullYear().toString().slice(2);
  },

  /**
   * date formatting with seconds included, e.g. 17/03/2012 - 12:34:21
   */
  formatDateSec : function( d ) {
    if ( ! d )
      d = new Date();

    var minutesAjusted = (d.getMinutes() + "").length == 1 ? "0" + d.getMinutes() : d.getMinutes();
    return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() +  " - " + d.getHours() + ":" + minutesAjusted + ":" + d.getSeconds();
  },

  /**
   * Executes a method and also binds it to window resize event 
   */
  onResizeAndNow : function ( func ) {
    func();
    $(window).resize(func);
  },
}
});


})(jQuery);