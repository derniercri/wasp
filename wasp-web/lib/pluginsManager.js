/*!
 * Wasp
 * Copyright(c) 2011, 2012 Nectify <dev@nectify.com>
 * Apache 2.0 Licensed
 */


var consts = require('./consts')
  , Logger = require('./logger')
  , fs = require('fs')
  , utils = require('./utils');


/**
 * manage plugins instances
 */
function PluginsManager( waspWeb ) {
  var that = this;

  var settings = waspWeb.settings;

  this.waspWeb = waspWeb;
  this.settings = settings;
  this.plugins = [];
  this.logger = new Logger( settings['log_level'] );

  this.sourceDirs = [];
  this.exposedCSS = [];
  this.exposedJS = [];
  this.includedTemplates = {};
  this.scriptsInits = [];

  this.redis = waspWeb.redis;
}


PluginsManager.prototype = {
  /**
   * Instanciate a plugin 
   */
  instanciate : function ( pluginConf ) {
    var $l = this.logger
      , type = pluginConf["type"];


    if ( ! pluginConf || !pluginConf["type"] ) {
      $l.error("Incorrect plugin format for plugin number : " + ( i + 1 ) , module);
      return;
    }

    var pluginClass
      , sourceDir;

    try { // first try, global plugin look up
      pluginClass = require( "wasp-web-plugin-" + pluginConf["type"] );
      sourceDir = "/node_modules/wasp-web-plugin-" + pluginConf["type"] + "/";
    }
    catch( e ) {
      try { // second try, local lookup (included plugins)
        pluginClass = require( "./../plugins/" + type );
        sourceDir = "/plugins/" + pluginConf["type"] + "/";
      }
      catch( pluginNotFoundException ) {
        $l.error("Plugin: \"" + type + "\" not found. Have you installed it?", module);
        return;
      }
    }

    var plugin = new pluginClass();

    // hooked!
    plugin.sourceDir = sourceDir;

    this.sourceDirs.push( sourceDir );

    // should add to connect the plugin public dir

    plugin.init( pluginConf, this );

    $l.info("Plugin: \"" + type + "\" loaded.", module);

    this.plugins.push[ plugin ];
  },

  /**
   * register a css file for being exposed later
   * path should be relative to public/ folder
   * i.e. "style.css" or "css/style.css"
   * You should carefully choose your css filename in order
   * to not be overidden by other plugins
   */
  exposeCSS : function( path, plugin ) {
    var exposedCSS = this.exposedCSS
      , $l = this.logger;

    if ( exposedCSS.indexOf( path ) > -1 ) {
      $l.error("CSS Conflict: this path is already exposed: " + path, module);
      return;
    }

    exposedCSS.push( path );
  },

  /**
   * register a js file for being exposed later
   * path should be relative to public/ folder
   * i.e. "script.js" or "js/script.js"
   * You should carefully choose your js filename in order
   * to avoid conflicts with other plugins
   */
  exposeJS : function( path, plugin ) {
    var exposedJS = this.exposedJS
      , $l = this.logger;

    if ( exposedJS.indexOf( path ) > -1 ) {
      $l.error("JS Conflict: this path is already exposed: " + path, module);
      
      return;
    }

    exposedJS.push( path );
  },

  /**
   * register a mustache template for being included in the wasp dashboard
   * chose the right id to avoid conflict with other plugins
   */
  includeTemplate : function( id, template, plugin ) {
    var includedTemplates = this.includedTemplates
      , $l = this.logger;

    if ( includedTemplates[ id ] ) {
      $l.error("Template Conflict: this id is already taken: " + id, module);
      return;
    }

    var templateContent = fs.readFileSync(__dirname + "/.." + plugin.sourceDir + 'templates/' + template);

    includedTemplates[ id ] = templateContent;
  },

  /**
   * Adds a startup script for the plugin. 
   * Basically a raw javascript function that will be executed
   */
  addScript : function( scriptInitializer ) {
    var scriptsInits =  this.scriptsInits;

    scriptsInits.push( scriptInitializer );
  },


  /**
   * sync and load each init script by callback script initializers
   */
  loadScriptsInits : function( done ) {
    var scriptsInits = this.scriptsInits
      , initStack = []
      , counter = scriptsInits.length;

    if ( counter == 0 )
      done( initStack );

    var scriptStacker = function( initScript ) {
      initStack.push( initScript );

      if( --counter == 0 ) {
          done( initStack );
       }
    };

    for ( var i = 0; i < scriptsInits.length; i++ ) {
      scriptsInits[ i ]( scriptStacker );
    }
  }
};

/**
 * Export the constructor.
 */
exports = module.exports = PluginsManager;