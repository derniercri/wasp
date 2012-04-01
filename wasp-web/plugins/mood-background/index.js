/*!
 * Wasp
 * Copyright(c) 2011, 2012 Nectify <dev@nectify.com>
 * Apache 2.0 Licensed
 */

function MoodBackground() {};

MoodBackground.prototype = {
  init: function( cfg, pluginsManager ) {
    pluginsManager.exposeJS("wasp-plugins-mood-background.js");
    pluginsManager.exposeCSS("wasp-plugins-mood-background.css");
  }
};

exports = module.exports = MoodBackground;