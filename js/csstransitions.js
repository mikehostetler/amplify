(function ($) {
  $(function () {
    $("#components").delegate('li', 'mouseenter', function () {
      $(this)
        .find('a').stop(true,false).animate({color: "#000"}, 200)
        .find('em').stop(true, false).fadeTo(200, 1.0);
    }).delegate('li', 'mouseleave', function () {
      $(this)
        .find('a').stop(true, false).animate({color: "#aaa"})
        .find('em').stop(true, false).fadeTo(200,0.0);
    });

    $("nav.components").delegate('li:not(.active)', 'mouseenter', function () {
      $(this)
        .find('a').stop(true, false).fadeTo(200, 1.0);
    }).delegate('li:not(.active)', 'mouseleave', function () {
      $(this)
        .find('a').stop(true, false).fadeTo(200,0.0);
    });

    var powered_a = $(".powered-by-jquery a");
    $(".powered-by-jquery").hover(function () {
      powered_a.stop(true, false).fadeTo(500, 1.0);
    }, function () {
      powered_a.stop(true, false).fadeTo(500, 0.0);
    });
  });
}(jQuery));