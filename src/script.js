(function ($) {

    function calculatePosition(element) {
        var walker = $('#walk-wrapper');

        var size = element.outerHeight() > element.outerWidth() ? element.outerHeight() : element.outerWidth();
        if (size < 60) size = 60;
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

    function setupHandlers(element, closeCallback) {
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
            if(closeCallback) {
                if (typeof closeCallback == 'Function') closeCallback();
                else {
                    $._WALK_CURRENT_POINT++;
                    var point = $._WALK_CURRENT_WALKPOINTS[$._WALK_CURRENT_POINT];
                    // Se o ponto existe, entao pegue-o!
                    console.log($._WALK_CURRENT_POINT);
                    if (!!point) {
                        $(point.selector).walk(point.text, point.color);
                    } else {
                        if ($._WALK_CURRENT_ENDCALLBACK) $._WALK_CURRENT_ENDCALLBACK();
                    }
                }
            }
            $(window).off('resize', handlers);
        });
    };

    $._WALK_CURRENT_WALKPOINTS;
    $._WALK_CURRENT_ENDCALLBACK;
    $._WALK_CURRENT_POINT;

    /**
     * Walk Function. Show a walkthrough for a single point.
     * @param {string}   contentText     Text that will be displayed in the content of the walkthrough;
     * @param {string}   [color]         Optional (for default blue color). Color in hash hex or in rgb() function;
     * @param {function|boolean} [closeCallback] Callback that will be called when the walkthrough point is closed. Or a boolean used to indicate if the walk is compound;
     */
    $.fn.walk = function (contentText, color, closeCallback) {
        var element = this;
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
            'border-color': (!!color) ? color : '#2196F3'
        });

        var walker_text = $('#walk-text');
        walker_text.html(contentText);

        setTimeout(function () {
            $('#walk-wrapper').show();
        }, 500);

        calculatePosition(element);
        calculateTextPosition(element);
        setupHandlers(element, closeCallback);
    };

    /**
     * Set a walkthrough for multiple points in order.
     * @param {object[]} walkPoints A WalkPoints array to set.
     */
    $.walk = function (walkPoints, endCallback) {
        $._WALK_CURRENT_WALKPOINTS = walkPoints;
        $._WALK_CURRENT_POINT = 0;
        $._WALK_CURRENT_ENDCALLBACK = endCallback;

        var point = walkPoints[0];
        $(point.selector).walk(point.text, point.color, true);
    }

})(jQuery);
