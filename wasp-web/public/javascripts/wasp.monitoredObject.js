(function($) {

var monitoredObjectsListId = '#monitored-objects'; // this is where monitored objects should be listed

/**
 * A monitored object is something that has a status. 
 * It can be either a worker or a watcher
 */
MonitoredObject = function() {
  this.events = {};
  this.subObjects = [];
};
MonitoredObject.prototype = {
  /**
   * initialize a new monitored object with an id and its status data
   * status data is like
   */
  init : function( id, report ) {
    this.id = id;

    this.update( report );

    this.render();
  },


  /**
   * adds a sub object. Sub object are delete on status down
   */
  addSubObject : function( mo ) {
    this.subObjects.push( mo )
  },


  /**
   * Fire an event. Will execute any callback attached to it
   */
  fire :  function( eventName, args ) {
    if ( ! eventName in this.events )
      return;

    var handlers = this.events[eventName];
       
    for ( var i in handlers ) {
      handlers[i].call(this, args);
    }
  },


  /**
   * Should make the element clearly visible
   * Actually it put the element in the top of the monitoredObjects list
   */
  focus : function() {
    this.element
      .detach()
      .prependTo( monitoredObjectsListId );
  },


  /**
   * Register a callback for event named eventName
   */
  on : function( eventName , callback) {
    var events = this.events;

    if ( ! ( eventName in events ) ) 
      events[eventName] = [];

    events[ eventName ].push( callback );
  },


  remove : function() {
    if ( this.element )
      this.element.remove();

    this.element = undefined;
  },


  /**
   * Insert object in the dom if not already been done
   */
  render : function() {
    var el = this.element;

    var elId = "mo-" + this.id;

    var newEl = $.mustachize('monitored-object', this.data );

    newEl.attr('id', elId);

    if ( el ) {
      el.replaceWith( newEl );
    }
    else {
      newEl
        .hide()
        .appendTo( monitoredObjectsListId )
        .slideDown();  
    }

    this.element = newEl;
    
    if ( this.data['status'] == 0 )
      this.focus();
  },

  /**
   * returns the status
   */
  status : function() {
    return this.data['status'];
  },


  /**
   *  update a monitored object data with its status data
   */
  update : function( report ) {
    if ( ! report )
      return;

    this.report = report;

    if ( ! this.data )
      this.data = {};

    this.data = report;

    // if no host is specified then we are showing a worker
    this.data['hostname'] = report['hostname']; // ? report['hostname'] : "W: " + this.id;

    // if no host is specified then we are showing a worker
    if ( this.data['hostname'] ) {
      this.data['name'] = report['name'];
    }
    else {
      if ( report['name'] ) // worker is up, then we 
        this.data['name'] = report['name'] + "@" + this.id ;
      else
        this.data['name'] = "@" + this.id;
    }

    this.updateStatus( report['status'] )
  },

  /**
   * updates the monitored object status, 
   * doing all the necessary related stuff like focusing
   */
  updateStatus : function( status ) {
    var previousStatus = this.data['status'];

    this.data['status'] = status;
    this.data['statusClass'] = status == 1 ? "up" : "down";

    if ( previousStatus !== undefined && previousStatus !== status ) {

      if ( status == 1 )
        $w.messagePanel.serviceUp( this.data['name'] , this.data['hostname'])
      else 
        $w.messagePanel.serviceDown( this.data['name'] , this.data['hostname'])
    }

    if ( status != 1 ) {
      for ( var i in this.subObjects ) {
        var mo = this.subObjects[i];

        $w.monitoredObjectsManager.delete( mo.id );
      }

      this.subObjects = [];
    }

    
    var statusName = (status == 1) ? "up" : "down";

    this.fire("statusChanged", { status: statusName })
  } 


};

/**
 * monitored objects manager
 */
$.extend( wasp, {
monitoredObjectsManager: {
  monitoredObjects: {},
  events: {},

  /**
   * returns the monitored object for the given id
   */
  find : function( id ) {
    var mos = $w.monitoredObjectsManager.monitoredObjects;
  
    return mos[id];
  },

  /**
   * id, (optional: report )
   * returns the monitored object for the given id
   */
  findOrCreate : function( id, report ) {
    var mos = $w.monitoredObjectsManager.monitoredObjects;

    if ( id in mos ) {
      if ( report ) {
        mos[id].update( report );
        mos[id].render();
      }
      
      return mos[id];
    }

    var mo = new MonitoredObject();

    mo.on("statusChanged", $w.monitoredObjectsManager.updateGlobalStatus );
    mos[id] = mo;  

    mo.init( id , report );    

    return mo;
  },


  delete : function( id ) {
    var mos = $w.monitoredObjectsManager.monitoredObjects;

    if ( id in mos ) {
      var mo = mos[id];

      mo.remove();

      delete mos[id];
    }
  },


  /**
   * update the global status
   * up if each monitored object is up
   * else down
   */
  updateGlobalStatus : function() {
    var previousStatus = $w.monitoredObjectsManager.globalStatus
      , mos = $w.monitoredObjectsManager.monitoredObjects;

    var up = true;
    for ( var i in mos ) {
      var mo = mos[i];

      if ( mo.data['status'] != 1 ) {
        up = false;
        break;
      }
    }

    var currentStatus = up ? "up" : "down";

    if ( currentStatus != previousStatus ) {
      $w.fire("globalStatusChanged", { status: currentStatus });
      $w.monitoredObjectsManager.globalStatus = currentStatus;
    }

  }
}
});

})(jQuery);