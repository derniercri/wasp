/*!
 * Wasp
 * Copyright(c) 2011, 2012 Nectify <dev@nectify.com>
 * Apache 2.0 Licensed
 */

function System() {};

System.prototype = {
  init: function( cfg, pluginsManager ) {
    pluginsManager.exposeJS("wasp-plugins-system.js");
    pluginsManager.exposeCSS("wasp-plugins-system.css");
    pluginsManager.includeTemplate("system", "wasp-plugins-system.template", this);

    pluginsManager.addScript( function( scriptStacker ) {
      scriptStacker( "$w.plugins.system.init({ip: '" + cfg['ip'] + "', name: '" + cfg['name'] + "'});");
    });
  }
};

exports = module.exports = System;