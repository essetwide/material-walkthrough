(function ($) {

     //Locking scroll
        //Thanks to @galambalazs
        // left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {37: 1, 38: 1, 39: 1, 40: 1, 32: 1, 33: 1, 34: 1};

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;  
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function disableScroll() {
  if (window.addEventListener) // older FF
      window.addEventListener('DOMMouseScroll', preventDefault, false);
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove  = preventDefault; // mobile
  document.onkeydown  = preventDefaultForScrollKeys;
}

function enableScroll() {
    if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.onmousewheel = document.onmousewheel = null; 
    window.onwheel = null; 
    window.ontouchmove = null;  
    document.onkeydown = null;  
}

    function calculatePosition(element) {

        var walker = $('#walk-wrapper');

        var size = element.outerHeight() > element.outerWidth() ? element.outerHeight() : element.outerWidth();
        if (size < 60) size = 60;
        console.log('walk size:' + size);

        var position = element.offset();
        console.log('walk position:' + position.left + 'x' + position.top);

        console.log('scroll to: ' + (position.top - ($(window).height() / 2)));
        $('html, body').animate({
            scrollTop: (position.top - ($(window).height() / 2))
        }, 500);

        walker.css({
            'height': (size + 20) + 'px',
            'width': (size + 20) + 'px',

            'margin-left': -((size + 20) / 2) + 'px',
            'margin-top': -((size + 20) / 2) + 'px',

            'left': (position.left + (element.outerWidth() / 2)) + 'px',
            'top': (position.top + (element.outerHeight() / 2)) + 'px',
        });

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
            /*;*/
            if (closeCallback) {
                if (typeof closeCallback == 'Function') closeCallback();
                else {
                    $._WALK_CURRENT_POINT++;
                    var point = $._WALK_CURRENT_WALKPOINTS[$._WALK_CURRENT_POINT];
                    console.log($._WALK_CURRENT_POINT);
                    // Se o ponto existe, entao pegue-o!
                    if (!!point) {
                        $(point.selector).walk(point.text, point.color);
                    } else {
                        $('html').css({
                'height': '',
                'overflow': 'auto'
            })
                        enableScroll();
                        if ($._WALK_CURRENT_ENDCALLBACK) $._WALK_CURRENT_ENDCALLBACK();
                    }
                }
            }
            $(window).off('resize', handlers);
        });

       disableScroll();

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
            'height': '100vh',
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
