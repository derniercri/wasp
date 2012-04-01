(function($) {
/**
 * Base JS logging func
 */
$.fn.log = function (msg , noDate) {
  if (window.console != undefined) {
    var dateStr = "[" + $w.utils.formatDateSec() + "] " ;

    if ( noDate ) 
      dateStr = "";

    console.log( dateStr + "%s: %o", msg, this);
  }
  
  return this;
};


/**
 * Mustache utility shortchut
 */
$.mustachize = function(templateId, view, partials) {
  var template = $('#tmpl-' + templateId).html();
  return $( Mustache.to_html(template, view, partials) );
};


/**
 * Mustache utility shortchut (2)
 */
$.fn.mustachize = function(templateId, view, partials) {
  this.html($.mustachize(templateId, view, partials));
};


})(jQuery);