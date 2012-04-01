
(function($) {

var pad2 = function( nb ) {
  return (nb < 10 ? '0' : '') + nb;
}

$w.on('load', function() {
  var calendarBoxId = $w.newBox("calendar")
    , $calendar = $("#" + calendarBoxId );

  setInterval(
    function() {
      var date = new Date();

      var hour = date.getHours()
        , minutes = pad2( date.getMinutes() )
        , time = hour + ":" + minutes
        , day = date.getDate()
        , month = $w.utils.monthsName[ date.getMonth() ]
        , year = date.getFullYear().toString().slice(2)
        , date = day + " " + month + ". " + year;

      $calendarContent = $.mustachize( "calendar" , { time: time, date: date} );
      $calendar.html( $calendarContent );
    }, 
    1000
  );
});

})(jQuery);