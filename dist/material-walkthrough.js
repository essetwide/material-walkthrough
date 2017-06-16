/**
 * Copyright 2017 Esset Software LTD.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var _logenv = {
    MSG: false,
    WALK_CONTENT: false,
    WALK_CONTENT_TOP: false,
    WALK_LOCK: false,
    WALK_SCROLL: false,
    ALL: false
};
function _log(context, message) {
    if(!!_logenv[context] || _logenv.ALL) console.log(context +': '+ message);
}

/**
 * @license Apache License 2.0.
 * @copyright Esset Software LTD.
 */
(function($) {

    var WALK_DEFAULT_COLOR = '#2196F3';
    var WALK_TRANSITION_DURATION = 500;
    var WALK_MIN_SIZE = 60;
    var WALK_PADDING = 20;
    var WALK_COMPONENT =
        "<div id='walk-wrapper'>" +
            "<div id='walk-content-wrapper'>" +
                "<div id='walk-content'></div>" +
                "<button id='walk-action'></button>" +
            "</div>" +
        "</div>";

    var walkWrapper = {};
    var walkContentWrapper = {};
    var walkContent = {};
    var walkActionButton = {};
    var walkUpdateHandler = null;

    /**
     * A Object that configures an walkpoint.
     * @typedef {object} WalkPoint
     * @property {string} target A jQuery selector of the element that the walk will focus;
     * @property {string} content A HTML code that will be inserted on the walk-content container;
     * @property {string} [color] A CSS (rgb, rgba, hex, etc.) color specification that will paint the walk. #2196F3 is default;
     * @property {string} [acceptText] The text of the accept button of the walk;
     * @property {function} [onSet] A function that will be called when the walk content is setted;
     * @property {function} [onClose] A function that will be called when the walk is accepted;
     */

    /***
     * Open the walker to a walkpoint.
     * @param {WalkPoint} walkPoint The configuration of the walkpoint
     */
    $.fn.walk = function (walkPoint) {
        var target = this;

        disableScroll();
        //REVIEW jQuery to JS Changes
        removeClasse(walkWrapper, 'closed');
        //walkWrapper.removeClass('closed');
        setWalker(target, walkPoint);
    };

    /***
     * Set the opened walker to a target with the properties from walkPoint.
     * @param {string|HTMLElement|JQueryElement} target A query or a Element to target the walker
     * @param {WalkPoint} walkPoint The properties for this walker
     */
    function setWalker(target, walkPoint) {
        target = $(target);
        _log('MSG', '-------------------------------------');
        _log('MSG', 'Setting a walk to #' + target[0].id);
        _log('WALK_SETUP', 'Properties:\n' + JSON.stringify(walkPoint, null, 2));

        setupListeners(target, walkPoint.onClose);
        //REVIEW jQuery to JS Changes
        //walkContentWrapper.css('display', 'none');
        setCss(walkContentWrapper,{
           'display' : 'none',
        });
        locateTarget(target, function () {
            setProperties(walkPoint.content, walkPoint.color, walkPoint.acceptText);
            //REVIEW jQuery to JS Changes
            //walkWrapper.css('display', 'block');
            setCss(walkWrapper,{
                'display' : 'block',
            });
            renderFrame(target, function () {
                //REVIEW jQuery to JS Changes
                //walkWrapper.addClass('opened');
                addClasse(walkWrapper,'opened');
                renderContent(target, function() {
                    //REVIEW jQuery to JS Changes
                    //walkContentWrapper.css('display', '');
                    setCss(walkWrapper,{
                        'display' : '',
                    });
                });
            });
        });

        _log('MSG', 'Walk created. Calling onSet() (if exists)');
        if (!!walkPoint.onSet) walkPoint.onSet(walkContent);
    }

    /***
     * Close the walker and flush its Listeners.
     */
    function closeWalker() {
        _log('MSG', 'Closing Walker');

        flushListeners();
        enableScroll();
        walkWrapper.css({marginTop: '-500px', marginLeft: '-500px'});
        walkWrapper.addClass('closed');
        setTimeout(function () {
            walkWrapper.css('display', 'none');
            walkWrapper.removeClass('opened');
        }, WALK_TRANSITION_DURATION);

        _log('MSG', 'Walker Closed!');
    }

    /***
     * Set the properties for the walk.
     * @param {string} content The content that will be displayed in the walk
     * @param {string} color A CSS valid color
     * @param {string} acceptText The text that will be displayed in the accept button
     */
    function setProperties(content, color, acceptText) {
        color = !!color ? color : WALK_DEFAULT_COLOR;
        //REVIEW jQuery to JS Changes
        walkContent.innerHTML = content;
        setCss(walkWrapper, {
            'border-color': color,
        });
        walkActionButton.innerHTML = acceptText;
        //walkContent.html(content);
        //walkWrapper.css('border-color', color);
        //walkActionButton.text(acceptText);
    }

    /***
     * Create the function that updates the walker to a target
     * @param {JQueryElement} target  The target to set the update function
     * @returns {function} Update handler to call in the listeners
     */
    function createUpdateHandler(target) {
        _log('WALK_UPDATE', 'Creating UpdateHandler for #' +target[0].id);

        var updateHandler =  function () {
            _log('MSG', 'Updating and rendering');
            locateTarget(target, function () {
                renderFrame(target, function () {
                    renderContent(target);
                });
            });


        };
        updateHandler.toString = function () {
            return 'updateHandler -> #' + target[0].id;
        };
        return updateHandler;
    }

    /***
     * Setup the update listeners (onResize, MutationObserver) and the close callback.
     * @param {JQueryElement} target The target to set the listeners
     * @param {function} onClose Close callback
     */
    function setupListeners(target, onClose) {
        if(!!walkUpdateHandler) flushListeners();
        walkUpdateHandler = createUpdateHandler(target);

        $(window).on('resize', walkUpdateHandler);
        $.walk._mutationObserver = new MutationObserver(walkUpdateHandler);
        $.walk._mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        //REVIEW jQuery to JS Changes
        // walkActionButton.addEventListener("click", myScript);
        walkActionButton.onclick = function actionCallback(){
        // walkActionButton.on('click', function actionCallback(){
            if (!!onClose) onClose();
            if (!!$.walk._points && !!$.walk._points[$.walk._currentIndex + 1]) {
                $.walk._currentIndex++;
                setWalker($.walk._points[$.walk._currentIndex].target, $.walk._points[$.walk._currentIndex]);
            } else {
                $.walk._currentIndex = 0;
                $.walk._points = null;
                if($.walk._callback) $.walk._callback();
                $.walk._callback = null;
                closeWalker();
            }
            walkActionButton.off('click', actionCallback);
        };
    }

    /***
     * Clean the listeners with the actual updateHandler
     */
    function flushListeners() {
        _log('WALK_UPDATER', 'Flushing handlers\n' + walkUpdateHandler);
        if(!!$.walk._mutationObserver) $.walk._mutationObserver.disconnect();
        $.walk._mutationObserver = null;
        $(window).off('resize', walkUpdateHandler);
    }

    /***
     * Move the Walker to a target
     * @param {JQueryElement} target
     */
    function locateTarget(target, locateCallback) {
        var position = target.offset();
        var positionMode = window.getComputedStyle(target[0])['position'];
        var windowHeight = $(window).height();
        var documentHeight = $(document.body).height();

        var positionOutOfBounds = (positionMode == 'absolute' || positionMode == 'relative') &&
            parseInt(window.getComputedStyle(target[0])['top']) > documentHeight; // Test if the position of the target is out of the document height by a forced position;

        _log('WALK_LOCK', 'Moving Walker to:\n' + JSON.stringify(position, null, 2));
        _log('WALK_SCROLL', 'documentHeight: ' +documentHeight);

        var scrollTo = (position.top - (windowHeight / 2));
        _log('WALK_LOCK', 'Trying to centralize the target in the screen: \n ' + JSON.stringify({
                scrollTo: scrollTo,
                targetY: position.top,
                windowHeightPer2: windowHeight / 2,
                targetPositionMode: positionMode,
                positionOutOfBounds: positionOutOfBounds
        }, null, 2));

        if (scrollTo > 0 && positionMode != 'fixed') {
            _log('WALK_LOCK', 'Scrolling to ' +scrollTo);
            _log('WALK_SCROLL', 'scrollTo + windowHeight: ' +(scrollTo + windowHeight));
            if (scrollTo + windowHeight > documentHeight && !positionOutOfBounds) scrollTo = documentHeight - windowHeight; // Setting the scroll limit by the document's height
            _log('WALK_LOCK', 'Corrected scroll amount: ' +scrollTo);

            $('body,html').animate({
                scrollTop: scrollTo
            }, WALK_TRANSITION_DURATION, function () {
                locateCallback();
            });
        } else {
            _log('WALK_LOCK', 'Resetting scroll');
            $('body,html').animate({
                scrollTop: 0
            }, WALK_TRANSITION_DURATION, function () {
                locateCallback();
            });
        }

    }

    function renderFrame(target, renderCallback) {
        var position = target.offset();
        var height = target.outerHeight();
        var width = target.outerWidth();

        var holeSize = height > width ? height : width; // Catch the biggest measure
        if (holeSize < WALK_MIN_SIZE) holeSize = WALK_MIN_SIZE; // Adjust with default min measure if it not higher than it
        _log('WALK_LOCK', 'Walk hole size ' +holeSize+ 'px');

        //REVIEW jQuery to JS Changes
        setCss(walkWrapper,{
            'height': (holeSize + WALK_PADDING) + 'px',
            'width': (holeSize + WALK_PADDING) + 'px',

            'margin-left': -((holeSize + WALK_PADDING) / 2) + 'px',
            'margin-top': -((holeSize + WALK_PADDING) / 2) + 'px',

            'left': (position.left + (width / 2)) + 'px',
            'top': (position.top + (height / 2)) + 'px',
        });
        /*
        walkWrapper.css({
            'height': (holeSize + WALK_PADDING) + 'px',
            'width': (holeSize + WALK_PADDING) + 'px',

            'margin-left': -((holeSize + WALK_PADDING) / 2) + 'px',
            'margin-top': -((holeSize + WALK_PADDING) / 2) + 'px',

            'left': (position.left + (width / 2)) + 'px',
            'top': (position.top + (height / 2)) + 'px',
        });
        */

        setTimeout(function () {
            renderCallback();
        }, 250);
    }

    function renderContent(target, renderCallback) {
        walkWrapper = $('#walk-wrapper');
        walkContentWrapper = $('#walk-content-wrapper');
        walkContent = $('#walk-content');
        walkActionButton = $('#walk-action');
        var position = target.offset();

        var itCanBeRenderedInRight = position.left + (walkWrapper.outerWidth() - WALK_PADDING) + walkContentWrapper.outerWidth() < $(window).outerWidth();
        var itCanBeRenderedInLeft = (position.left - WALK_PADDING) - walkContentWrapper.outerWidth() > 0;

        var itCanBeRenderedInTop = walkWrapper[0].getBoundingClientRect().top - walkContentWrapper.outerHeight() > 0;
        var itCanBeRenderedInBottom = walkWrapper[0].getBoundingClientRect().top + walkWrapper.outerHeight() + walkContentWrapper.outerHeight() < $(window).outerHeight();

        _log('WALK_CONTENT', 'itCanBeRenderedInRight: ' +itCanBeRenderedInRight);
        _log('WALK_CONTENT', 'itCanBeRenderedInLeft: ' +itCanBeRenderedInLeft);
        _log('WALK_CONTENT', 'itCanBeRenderedInTop: ' +itCanBeRenderedInTop);
        _log('WALK_CONTENT', 'itCanBeRenderedInBottom: ' +itCanBeRenderedInBottom);

        var positionLeft = '100%';
        var positionTop = '100%';
        var marginTop = 0;
        var marginLeft = 0;
        var textAlign = 'left';

        if (!itCanBeRenderedInRight) {
            positionLeft = itCanBeRenderedInLeft ? '-'+ walkContentWrapper.outerWidth() +'px': (itCanBeRenderedInBottom ? '0%':  '25%');
            textAlign = itCanBeRenderedInLeft ? 'right' : 'center';
            marginTop = itCanBeRenderedInLeft ? 0 : (itCanBeRenderedInBottom ? '20px' : '-20px');
        }
        if (!itCanBeRenderedInBottom) {
            positionTop = itCanBeRenderedInTop ? '-'+ walkContentWrapper.outerHeight() +'px': walkWrapper.outerHeight() / 2 - walkContentWrapper.outerHeight() / 2 + 'px';
            marginLeft = itCanBeRenderedInTop ? 0 : (!itCanBeRenderedInRight ? '-20px' : '20px');
        }

        //REVIEW jQuery to JS Changes
        // setCss(walkContentWrapper,{
        //     'left': positionLeft,
        //     'top': positionTop,
        //     'text-align': textAlign,
        //     'margin-top': marginTop,
        //     'margin-left': marginLeft
        // });

        walkContentWrapper.css({
            'left': positionLeft,
            'top': positionTop,
            'text-align': textAlign,
            'margin-top': marginTop,
            'margin-left': marginLeft
        });

        if(renderCallback) renderCallback();
    }

    $.walk = function (walkPoints, callback) {
        $.walk._points = walkPoints;
        $.walk._currentIndex = 0;
        $.walk._callback = callback;

        $(walkPoints[0].target).walk(walkPoints[0]);
    };

    /**
     * Global variable that holds the current walk configuration.
     * @type {WalkPoint[]}
     */
    $.walk._points = null;

    /**
     * Global variable that holds the current point index in _walkPoints array.
     * @type {number}
     */
    $.walk._currentIndex = 0;

    /**
     * Global variable that holds the MutationObserver that listen body modifications.
     * @type {MutationObserver}
     */
    $.walk._mutationObserver = null;

    //REVIEW jQuery to JS Changes
    function init() {
        appendContent(document.getElementsByTagName("body")[0],WALK_COMPONENT);
        walkWrapper = document.getElementById('walk-wrapper');
        walkContentWrapper = document.getElementById('walk-content-wrapper');
        walkContent = document.getElementById('walk-content');
        walkActionButton = document.getElementById('walk-action');
        // $('body').append(WALK_COMPONENT);
        // walkWrapper = $('#walk-wrapper');
        // walkContentWrapper = $('#walk-content-wrapper');
        // walkContent = $('#walk-content');
        // walkActionButton = $('#walk-action');
    }
    init();











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
    //REVIEW jQuery to JS Changes
    function disableScroll() {

        setCss(document.getElementsByTagName("html")[0],{
            'height': '100vh',
            'overflow': 'hidden'
        });
       /* $('html').css({
            'height': '100vh',
            'overflow': 'hidden'
        });*/
        if (window.addEventListener) // older FF
            window.addEventListener('DOMMouseScroll', preventDefault, false);
        window.onwheel = preventDefault; // modern standard
        window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
        window.ontouchmove = preventDefault; // mobile
        document.onkeydown = preventDefaultForScrollKeys;
    }

    //REVIEW jQuery to JS Changes
    function enableScroll() {
        setCss(document.getElementsByTagName("html")[0],{
            'height': '',
            'overflow': 'auto'
        });
        /*$('html').css({
            'height': '',
            'overflow': 'auto'
        });*/
        if (window.removeEventListener)
            window.removeEventListener('DOMMouseScroll', preventDefault, false);
        window.onmousewheel = document.onmousewheel = null;
        window.onwheel = null;
        window.ontouchmove = null;
        document.onkeydown = null;
    }

    //REVIEW jQuery to JS Changes
    function setCss(element, properties){
            Object.getOwnPropertyNames(properties).forEach(function (val) {
                element.style[val] = properties[val];
            });
    }

    //REVIEW jQuery to JS Changes
    function appendContent(element, content) {
        element.innerHTML += content;
    }

    //REVIEW jQuery to JS Changes
    function removeClasse(element, className){
        element.classList.remove(className);
    }

    //REVIEW jQuery to JS Changes
    function addClasse(element, className){
        element.classList.add(className);
    }
})(window.$);