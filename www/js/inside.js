// JavaScript Document

var $j = jQuery.noConflict();

$j(document).ready(function() {
	/*$j('#webapp-product-data').on('click', '.ui-list-view', function () {
		$j("#tabs").tabs("option", "active", $j(this).attr('data-index'));
	});*/
});

/* TAB PAGE SLIDE NAVIGATION */

$j(document).on("tabsbeforeactivate", "#tabs", function (e, ui) {
    $j(ui.newPanel).addClass("in flip").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
        $j(this).removeClass("in flip");
    });
});

/*$j(window).scroll(function(){
		if ($j(this).scrollTop() > 150) {
			$j('#backToTopBtn').fadeIn();
		} else {
			$j('#backToTopBtn').fadeOut();
		}
	});    */
