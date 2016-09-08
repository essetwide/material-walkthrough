(function ($) {

    function calculatePosition(element) {
        var walker = $('#walk-wrapper');

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

        //window.scrollTo(0, element.scrollTop());

        $('html, body').animate({
            scrollTop: element.scrollTop()
        }, 750);
        setTimeout(function(){
            walker.show();
        }, 750);
    
    };

    function calculateTextPosition(element) {
        var size = element.outerHeight() > element.outerWidth() ? element.outerHeight() : element.outerWidth();
        var position = element.offset();
        var content = $('#walk-content');

        var canRenderInRight = position.left + size + 20 + content.outerWidth() < $(window).width();
        var canRenderInLeft = size + 20 + content.outerWidth() < $(window).width() / 2;

        var canRenderInBottom = position.top + size + 20 + content.outerHeight() < $(window).height();
        var canRenderInTop = size + 20 + content.outerHeight() < $(window).height() / 2;

        console.log('canRenderInRight: ' + canRenderInRight);
        console.log('canRenderInLeft: ' + canRenderInLeft);

        console.log('canRenderInBottom: ' + canRenderInBottom);
        console.log('canRenderInTop: ' + canRenderInTop);

        if (canRenderInRight || canRenderInLeft) {
            $('#walk-content').css({
                'left': canRenderInRight ? '100%' : '-300%',
                'top': canRenderInBottom ? '100%' : '-180%',
                'text-align': canRenderInRight ? 'left' : 'right'
            });
        } else {
            // FICA NO CENTRO HORIZONTAL
            $('#walk-content').css({
                'left': '-200%',
                'top': canRenderInBottom ? '100%' : '-180%',
                'text-align': 'left'
            });
        }
    }

    function setupHandlers(element) {
        $(window).on('resize', function () {
            calculatePosition(element);
            calculateTextPosition(element);
        });

        $('#walk-button').on('click', function () {
            $('#walk-wrapper').hide();
            $('html').css({
                'overflow': 'auto'
            });
        });
    };

    $.fn.walk = function (contentText, color) {
        if (!this.width()) return; //Tentei .isEmptyObject() mas ele sempre retornava falso
        $('html').css({
            'overflow': 'hidden'
        });
        var element = this;
        if ($('#walk-wrapper').length == 0) {
            $('body').append(`
	<div id="walk-wrapper">
        <div id="walk-content">
            <div id="walk-text">
            </div>
            <button id="walk-button">ENTENDI</button>
        </div>
    </div>
	`);
        }
        var walker = $('#walk-wrapper');
        walker.css({
            'border-color': (!!color) ? color : '#2196F3'
        });

        var walker_text = $('#walk-text');
        walker_text.html(contentText);

        calculatePosition(element);
        calculateTextPosition(element);
        setupHandlers(element);
    };
})(jQuery);