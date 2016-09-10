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

        $('html, body').animate({
            scrollTop: element.scrollTop()
        }, 500);
    
    };

    function calculateTextPosition(element) {
        var size = element.outerHeight() > element.outerWidth() ? element.outerHeight() : element.outerWidth();
        var position = element.offset();
        var content = $('#walk-content');

        var canRenderInLeft = position.left + 175 > content.width();
        var canRenderInRight = ($(window).width() - (position.left + 175)) > content.width();

        console.log('content.width: ' + content.width());
        console.log('position.left: ' + position.left);
        console.log('position.right: ' + ($(window).width() - position.left));
        console.log('canRenderInLeft: ' + canRenderInLeft + '\n canRenderInRight: ' + canRenderInRight);

        /*
        -170%    -75%    100%
        -100%   -100%   -100%
        
        -170%    -75%    100%
        -100%    100%    100%
         */

        if (canRenderInRight || canRenderInLeft) {
            $('#walk-content').css({
                'left': canRenderInRight ? '100%' : '-170%',
                'text-align': canRenderInRight ? 'left' : 'right'
            });
        } else { //centralizado
            $('#walk-content').css({
                'left': '-75%',
                'text-align': 'center'
            });
        }
    }

    function setupHandlers(element) {
        var handlers = function () {
            calculatePosition(element);
            calculateTextPosition(element);
        };
        $(window).on('resize', handlers);

        $('#walk-button').on('click', function () {
            $('#walk-wrapper').hide();
            $('html').css({
                'overflow': 'auto'
            });
            $(window).off('resize', handlers);
        });
    };
    $.walk = function (object) {
    //$.fn.walk = function (contentText, color) {
        var element = $('#'+object.id);
        if (!element.width()) return; //Tentei .isEmptyObject() mas ele sempre retornava falso
        $('html').css({
            'overflow': 'hidden'
        });
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
            'border-color': (!!object.color) ? object.color : '#2196F3'
        });

        var walker_text = $('#walk-text');
        walker_text.html(object.text);
        
        setTimeout(function(){
            $('#walk-wrapper').show();
        }, 500);
        
        calculatePosition(element);
        calculateTextPosition(element);
        setupHandlers(element);
    };
})(jQuery);