(function ($) {
    // Settings
    var WALK_MIN_SIZE = 60; // Defines a min size for the walk hole;
    var WALK_DEFAULT_COLOR = '#2196F3'; // Default color used when the color param is null;
    var WALK_TRANSITION_DELAY = 500; // Delay of walk transitions;
    var WALK_BLINK_TRANSITION = false; // hide/show in transitions;
    var WALK_MAX_PERCENTAGE_SIZE = 0.5; //;

    var walkContent = {};
    var walkWrapper = {};
    var walkText = {};
    var walkButton = {};

    /**
     * Global variable that holds the current walk configuration.
     * @type {WalkPoint[]}
     */
    $._walkPoints = [];

    /**
     * Global variable that holds the current callback function that will be called when the walk is ended.
     * @type {function}
     */
    $._walkCallback = null;

    /**
     * Global variable that holds the current point index in _walkPoints array.
     * @type {number}
     */
    $._walkCurrentIndex = 0;

    /**
     * Global variable that holds the MutationObserver that listen body modifications.
     * @type {MutationObserver}
     */
    $._walkMutationObserver = null;


    function init() {
        $('body').append("<div id='walk-wrapper'><div id='walk-content'><div id='walk-text'></div><button id='walk-button'></button></div></div>");
        walkContent = $('#walk-content');
        walkWrapper = $('#walk-wrapper');
        walkText = $('#walk-text');
        walkButton = $('#walk-button');
    }

    function calculatePosition(targetElt) {
        console.log('CALCULATING WALK POSITION:');

        var holeSize = targetElt.outerHeight() > targetElt.outerWidth() ? targetElt.outerHeight() : targetElt.outerWidth(); // Pegar a maior medida
        if (holeSize < WALK_MIN_SIZE) holeSize = WALK_MIN_SIZE;
        console.log('\thole size:' + holeSize);

        var position = targetElt.offset();
        console.log('\tposition:\n\t\tx: ' + position.left + '\n\t\ty: ' + position.top);

        var scrollTo = (position.top - ($(window).height() / 2)); // Tenta centralizar a tela com a posição do alvo
        if (scrollTo > 0) {
            if (scrollTo + $(window).height() > $(document.body).height()) scrollTo = $(document.body).height() - $(window).height(); //Definindo o limite a partir do tamanho do documento;
            console.log('\tscrolling to: ' + scrollTo);
            $('html, body').animate({
                scrollTop: scrollTo
            }, WALK_TRANSITION_DELAY);
        }

        // Fixing zoom
//        var smallestMeasure = $(window).height() > $(window).width() ? $(window).width() : $(window).height();
//        if (holeSize > smallestMeasure * WALK_MAX_PERCENTAGE_SIZE) {
//            var zoomAmount = (100 - WALK_MAX_PERCENTAGE_SIZE * 100);
//            console.log('\tsetting zoom: ' + zoomAmount);
//            $(document.body).css('zoom', zoomAmount + '%');
//        }


        console.log('\tRENDERING...');
        walkWrapper.css({
            'height': (holeSize + 20) + 'px',
            'width': (holeSize + 20) + 'px',

            'margin-left': -((holeSize + 20) / 2) + 'px',
            'margin-top': -((holeSize + 20) / 2) + 'px',

            'left': (position.left + (targetElt.outerWidth() / 2)) + 'px',
            'top': (position.top + (targetElt.outerHeight() / 2)) + 'px',
        });

    };

    function calculateTextPosition(targetElt) {
        var position = targetElt[0].getBoundingClientRect();

        console.log('CALCULATING TEXT POSITION:');
        var canRenderInLeft = position.left + 175 > walkContent.width(); // 175 é a metade da largura do conteudo
        var canRenderInRight = ($(window).width() - (position.left + 175)) > walkContent.width();
        console.log('\tcanRenderInLeft: ' + canRenderInLeft + '\n\tcanRenderInRight: ' + canRenderInRight);

        // REVER
        var canRenderInTop = position.top + walkContent.height() / 2 > $(window).height() / 2;
        var canRenderInBottom = $(window).height() - (position.top + walkWrapper.height() / 2) > walkContent.height();

        console.log('\tcanRenderInTop: ' + canRenderInTop + '\n\tcanRenderInBottom: ' + canRenderInBottom);
        console.log("\t\tEspaco Livre:"+ ($(window).height() - (position.top + walkWrapper.height() / 2) ));
        console.log("\t\tEspaco Necessário: "+walkContent.height());

        /* QUADRO DE POSIÇÕES
         LEFT: -170%  -40%    100%
         TOP:  -70%   -70%   -70%     <-- top minimo para posiçao superior. Se a caso o conteudo do texto for grande, diminuir mais ainda este numero

         LEFT: -170%    -40%    100%
         TOP:  100%    100%    100%
         */

        console.log('\tRENDERING...');
        if (canRenderInRight || canRenderInLeft) {
            walkContent.css({
                'margin-top': '0px',
                'left': canRenderInRight ? '100%' : '-170%',
                'text-align': canRenderInRight ? 'left' : 'right',
            });
        } else { //centralizado
            walkContent.css({
                'margin-top': '20px',
                'left': '-40%',
                'text-align': 'center',
            });
        }

        if(!canRenderInBottom) {
            walkContent.css({
                'top': '-70%'
            });
        } else {
            walkContent.css({
                'top': '100%'
            });
        }
    }

    function updatePositions(element) {
        console.log('\n');
        calculatePosition(element);
        calculateTextPosition(element);
    };

    function setupHandlers(element) {
        function updateHandler() {
            console.error();
            updatePositions(element)
        }
        $(window).off('resize', updateHandler);
        $(window).on('resize', updateHandler);

        $._walkMutationObserver = new MutationObserver(updateHandler);
        $._walkMutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }



    /**
     * Walk Function. Show a walkthrough for a single point.
     * @param {string}   contentText     Text that will be displayed in the content of the walkthrough;
     * @param {string}   [color]         Optional (for default blue color). Color in hash hex or in rgb() function;
     * @param {string}   acceptText    The text that will be displayed on accept button;
     * @param {function} [closeCallback] Callback that will be called when the walkthrough point is closed;
     * @param {boolean}  [isPartial]     Or a boolean used to indicate if the walk is compound;
     */
    $.fn.walk = function (contentText, color, acceptText, closeCallback, isPartial) {
        var element = this;
        if (!element.width()) return;

        disableScroll();

        if ($('#walk-wrapper').length == 0) {
            init();
        }
        walkWrapper.show();
        walkContent.hide();
        walkText.html(contentText);
        walkButton.html(acceptText);
        
        if(isPartial && $._walkCurrentIndex == 0) {
            walkWrapper.removeClass('open');
        }
        setTimeout(function() {
            walkContent.show();
            if(isPartial && $._walkCurrentIndex == 0) walkWrapper.addClass('open');
        }, WALK_TRANSITION_DELAY);

        walkWrapper.css({
            'border-color': (!!color) ? color : WALK_DEFAULT_COLOR
        });


        if (WALK_BLINK_TRANSITION) {
            setTimeout(function () {
                walkWrapper.show();
            }, WALK_TRANSITION_DELAY);
        }

        updatePositions(element);
        setupHandlers(element, closeCallback);

        var confirmCallback = function () {
            if (WALK_BLINK_TRANSITION) walkWrapper.hide();
            if (!!isPartial) {
                $._walkCurrentIndex++;
                var point = $._walkPoints[$._walkCurrentIndex];
                // Se o ponto existe, entao pegue-o!
                if (!!point) {
                    walkButton.off('click', confirmCallback);
                    $._walkMutationObserver.disconnect();
                    $(point.selector).walk(point.text, point.color, point.acceptText, null, true);
                } else {
                    enableScroll();

                    walkButton.off('click', confirmCallback);
                    $._walkMutationObserver.disconnect();

                    if ($._walkCallback) $._walkCallback();
                    
                    walkWrapper.removeClass('open');
                    setTimeout(function(){
                        walkWrapper.hide();
                    }, WALK_TRANSITION_DELAY);
                }
            } else { // se é um walk único, então
                enableScroll();
                walkButton.off('click', confirmCallback);
                $._walkMutationObserver.disconnect();
                
                if (!!closeCallback) closeCallback();
                
                walkWrapper.removeClass('open');
                setTimeout(function(){
                        walkWrapper.hide();
                }, WALK_TRANSITION_DELAY);
            }
        };

        walkButton.on('click', confirmCallback);
    };

    /**
     * A Object that configures an walkpoint.
     * @typedef {object} WalkPoint
     * @property {string} selector A jQuery selector of the element that the walk will focus;
     * @property {string} [color] A CSS (rgb, rgba, hex, etc.) color specification that will paint the walk. #2196F3 is default;
     * @property {string} text The readable content of the walk;
     * @property {string} [acceptText] The text of the accept button of the walk;
     */

    /**
     * Start a walkthrough for multiple points in order.
     * @param {WalkPoint[]} walkPoints A WalkPoints array to set.
     * @param {function} [endCallback] An optional callback that will be executed when the walk is terminated.
     */
    $.walk = function (walkPoints, endCallback) {
        $._WALK_DEFAULT_DOCSIZE =
        $._walkPoints = walkPoints;
        $._walkCurrentIndex = 0;
        $._walkCallback = endCallback;

        var point = walkPoints[0];
        $(point.selector).walk(point.text, point.color, point.acceptText,null, true);
    };




    //Locking scroll
    //Thanks to @galambalazs
    // left: 37, up: 38, right: 39, down: 40,
    // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
    var keys = {
        37: 1,
        38: 1,
        39: 1,
        40: 1,
        32: 1,
        33: 1,
        34: 1
    };

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
        $('html').css({
            'height': '100vh',
            'overflow': 'hidden'
        });
        if (window.addEventListener) // older FF
            window.addEventListener('DOMMouseScroll', preventDefault, false);
        window.onwheel = preventDefault; // modern standard
        window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
        window.ontouchmove = preventDefault; // mobile
        document.onkeydown = preventDefaultForScrollKeys;
    }

    function enableScroll() {
        $('html').css({
            'height': '',
            'overflow': 'auto'
        });
        if (window.removeEventListener)
            window.removeEventListener('DOMMouseScroll', preventDefault, false);
        window.onmousewheel = document.onmousewheel = null;
        window.onwheel = null;
        window.ontouchmove = null;
        document.onkeydown = null;
    }

    init();
})(jQuery);
