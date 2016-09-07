(function ($) {

	function calculatePosition(element) {
		var walker = $('.walk-wrapper');

		var size = element.outerHeight() > element.outerWidth() ? element.outerHeight() : element.outerWidth();
		console.log('walk size:' + size);

		var position = element.offset();
		console.log('walk position:' + position.left + 'x' + position.top);

		walker.css({
			'height': (size + 20) + 'px',
			'width': (size + 20) + 'px',

			'margin-left': -((size + 20) / 2) + 'px',
			'margin-top': -((size + 20) / 2) + 'px',

			'left': (position.left + (element.outerWidth() / 2)) + 'px',
			'top': (position.top + (element.outerHeight() / 2)) + 'px',
		});
	};

	function calculateTextPosition (element) {
		var size = element.outerHeight() > element.outerWidth() ? element.outerHeight() : element.outerWidth();
		var position = element.offset();
		//console.log("Local: "+(position.left + size + 10)); //ESSE MAIS 10 EU NÃO SEI QUEM ESTÁ FORNCENDO(MARGIN, PADDING) MAS SEI QUE ELE EXISTE
 		//console.log($('.walk-text').offset());
 		//console.log("Windows width: "+$(window).width());
 		var espacoLivreDireita = $(window).width() - (position.left + size + 10);
 		var espacoLivreEsquerda = position.left - 10;
 		//console.log("Espaço livre: "+ espacoLivre);
 		var minWidth = parseInt($('.walk-text').css('min-width'));
 		//console.log("Min width: "+minWidth);
 		if(espacoLivreDireita>minWidth){
 			$('.walk-content').css('left','100%');
 			$('.walk-content').css('top','100%');
 			$('.walk-content').css('text-align','left');
 		}else if(espacoLivreEsquerda>minWidth){
 			console.log("Espaco Esquerda: "+espacoLivreEsquerda+" minWidth: "+minWidth);
 			$('.walk-content').css('left','-300%');
 			$('.walk-content').css('top','100%');
 			$('.walk-content').css('text-align','right');
 		}else{
 			$('.walk-content').css('left','-50%');
 			$('.walk-content').css('top','-180%');
 			$('.walk-content').css('text-align','left');
 		}

	};

	function setupHandlers(element) {
		$(window).on('resize', function () {
			calculatePosition(element);
			calculateTextPosition (element)
			console.log('yahoo');
		});
	};

	$.fn.walk = function (contentText, color) {
		var element = this;
		if ($('.walk-wrapper').length == 0) {
			$('body').append(`
	<div class="walk-wrapper">
        <div class="walk-content">
            <div class="walk-text">
            </div>
            <button class="walk-button">ENTENDI</button>
        </div>
    </div>
	`);
		}
		var walker = $('.walk-wrapper');
		walker.show();
		walker.css({
			'border-color': (color != '' || !!color) ? color : 'inherit'
		});
                var walker_text = $('.walk-text');
                walker_text.html(contentText);
                
		calculatePosition(element);
		calculateTextPosition(element);
		setupHandlers(element);
	};
})(jQuery);
