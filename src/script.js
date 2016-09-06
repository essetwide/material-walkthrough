(function ($) {
	$.fn.walk = function () {
		var element = this;
		if ($('.walk-wrapper').length == 0) {
			$('body').append(`
	<div class="walk-wrapper">
        <div class="walk-content">
            <div class="walk-text"> 
            </div>
            <button class="walk-button"></button>
        </div>
    </div>
	`);
		}
		var walker = $('.walk-wrapper');
		walker.show();
		
		var size = element.outerHeight() > element.outerWidth() ? element.outerHeight() : element.outerWidth();
		console.log('walk size:' + size);
		
		var position = element.offset();
		console.log('walk position:' + position.left + 'x' + position.top);
		
		
		walker.css({
			'height': size + 'px',
			'width': size + 'px',
			
			'margin-left': -(size / 2) + 'px',
			'margin-top': -(size / 2) + 'px',
			
			'left': (position.left + (element.outerWidth() / 2)) + 'px',
			'top': (position.top + (element.outerHeight() / 2)) + 'px',
		});
	};
})(jQuery);