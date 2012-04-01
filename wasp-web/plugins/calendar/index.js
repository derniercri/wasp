/*!
 * Wasp
 * Copyright(c) 2011, 2012 Nectify <dev@nectify.com>
 * Apache 2.0 Licensed
 */

function Calendar() {};

Calendar.prototype = {
  init: function( cfg, pluginsManager ) {
    pluginsManager.exposeJS("wasp-plugins-calendar.js");
    pluginsManager.exposeCSS("wasp-plugins-calendar.css");
    pluginsManager.includeTemplate("calendar", "wasp-plugins-calendar.template", this);
  }
};

exports = module.exports = Calendar;