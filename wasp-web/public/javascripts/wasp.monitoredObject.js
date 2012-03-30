(function($) {

var monitoredObjectsListId = '#monitored-objects'; // this is where monitored objects should be listed

/**
 * A monitored object is something that has a status. 
 * It can be either a worker or a watcher
 */
MonitoredObject = function() {};
MonitoredObject.prototype = {
  /**
   * initialize a new monitored object with an id and its status data
   * status data is like
   */
  init : function( id, props ) {
    this.id = id;

    this.update( props );

    this.render();
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
   *  update a monitored object data with its status data
   */
  update : function( props ) {
    if ( ! props )
      return; 

    if ( ! this.data )
      this.data = {};

    // if no host is specified then we are showing a worker
    this.data['hostname'] = props['hostname']; // ? props['hostname'] : "W: " + this.id;

    // if no host is specified then we are showing a worker
    this.data['name'] = this.data['hostname'] ? props['name'] : props['name'] + " (" + this.id + ")";

    this.updateStatus( props['status'] )
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
  } 


};

/**
 * monitored objects manager
 */
$.extend( wasp, {
monitoredObjectsManager: {
  monitoredObjects: {},

  /**
   * id, (optional: props )
   * returns the monitored Object corresponding to the given id
   */
  findOrCreate : function( id, props ) {
    var mos = $w.monitoredObjectsManager.monitoredObjects;

    if ( id in mos ) {
      if ( props ) {
        mos[id].update( props );
        mos[id].render();
      }
      
      return mos[id];
    }

    var mo = new MonitoredObject();
    mo.init( id , props );

    mos[id] = mo;

    return mo;
  }
}
});

})(jQuery);