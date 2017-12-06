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

const _logenv = {
    MSG: true,
    WALK_CONTENT: true,
    WALK_CONTENT_TOP: true,
    WALK_LOCK: true,
    WALK_SCROLL: true,
    ALL: true
};

function _log(context, message, ...attrs) {
    if(!!_logenv[context] || _logenv.ALL) console.log(context +': '+ message, ...attrs);
}

const dom = {
    get: (target) => {
        if (typeof target === 'string') return document.querySelector(target);
        return target;
    },
    setStyle: (element, properties) => {
        Object.keys(properties).forEach(function (val) {
            element.style[val] = properties[val];
        });
    },
    appendTo: (element, content) => {
        element.innerHTML += content;
    },
    removeClass: (element, className) => {
        element.classList.remove(className);
    },
    addClass: (element, className) => {
        element.classList.add(className);
    }
};

// Locking scroll
// Thanks to @galambalazs
const ScrollManager = {
    // left: 37, up: 38, right: 39, down: 40,
    // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
    keys: {
        37: 1,
        38: 1,
        39: 1,
        40: 1,
        32: 1,
        33: 1,
        34: 1
    },

    preventDefault: (e) => {
        e = e || window.event;
        if (e.preventDefault)
            e.preventDefault();
        e.returnValue = false;
    },
    preventDefaultForScrollKeys: (e) => {
        if (ScrollManager.keys[e.keyCode]) {
            ScrollManager.preventDefault(e);
            return false;
        }
    },
    disable: () => {
        dom.setStyle(dom.get('html'),{
            'height': '100vh',
            'overflow': 'hidden'
        });
        const preventDefault = ScrollManager.preventDefault;
        const preventDefaultForScrollKeys = ScrollManager.preventDefaultForScrollKeys;
        if (window.addEventListener) // older FF
            window.addEventListener('DOMMouseScroll', preventDefault, false);
        window.onwheel = preventDefault; // modern standard
        window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
        window.ontouchmove = preventDefault; // mobile
        document.onkeydown = preventDefaultForScrollKeys;
    },
    enable() {
        dom.setStyle(dom.get('html'),{
            'height': '',
            'overflow': 'auto'
        });
        if (window.removeEventListener)
            window.removeEventListener('DOMMouseScroll', ScrollManager.preventDefault, false);
        window.onmousewheel = document.onmousewheel = null;
        window.onwheel = null;
        window.ontouchmove = null;
        document.onkeydown = null;
    }
};



/**
 * A Object that configures an walkpoint.
 * @typedef {object} WalkPoint
 * @property {string|HTMLElement} target A selector or a pure Element that the walk will focus;
 * @property {string} content A HTML code that will be inserted on the walk-content container;
 * @property {string} [color] A CSS (rgb, rgba, hex, etc.) color specification that will paint the walk. #2196F3 is default;
 * @property {string} [acceptText] The text of the accept button of the walk;
 * @property {function} [onSet] A function that will be called when the walk content is setted;
 * @property {function} [onClose] A function that will be called when the walk is accepted;
 */

/**
 * @license Apache License 2.0.
 * @copyright Esset Software LTD.
 */
export default class MaterialWalkthrough {
    static DEFAULT_COLOR = '#2196F3';
    static DEFAULT_ACCEPT_TEXT = 'Ok';
    static TRANSITION_DURATION = 500;
    static MIN_SIZE = 60;
    static GUTTER = 20;
    static ELEMENT_TEMPLATE =
        `<div id='walk-wrapper'>
            <div id='walk-content-wrapper'>
                <div id='walk-content'></div>
                <button id='walk-action'></button>
            </div>
        </div>`;
    static isInitialized = false;

    static _wrapper = null;
    static _contentWrapper = null;
    static _content = null;
    static _actionButton = null;

    static _instance = {
        updateHandler: null,
        mutationObserver: null,
        points: null,
        currentIndex: null,
        onCloseCallback: null,
    };

    static _init() {
        dom.appendTo(dom.get('body'), MaterialWalkthrough.ELEMENT_TEMPLATE);
        MaterialWalkthrough._wrapper = dom.get('#walk-wrapper');
        MaterialWalkthrough._contentWrapper = dom.get('#walk-content-wrapper');
        MaterialWalkthrough._content = dom.get('#walk-content');
        MaterialWalkthrough._actionButton = dom.get('#walk-action');

        MaterialWalkthrough.isInitialized = true;
    }

    /***
     * Set the opened walker to a target with the properties from walkPoint.
     * @param {string|HTMLElement} target A query or a Element to target the walker
     * @param {WalkPoint} walkPoint The properties for this walker
     */
    static _setWalker(walkPoint) {
        let target = dom.get(walkPoint.target);
        _log('MSG', '-------------------------------------');
        _log('MSG', 'Setting a walk to #' + target.id);
        _log('WALK_SETUP', 'Properties:\n' + JSON.stringify(walkPoint, null, 2));

        MaterialWalkthrough._setupListeners(target, walkPoint.onClose);
        dom.setStyle(MaterialWalkthrough._contentWrapper, { display : 'none' });

        MaterialWalkthrough._locateTarget(target, () => {
            MaterialWalkthrough._setProperties(walkPoint.content, walkPoint.color, walkPoint.acceptText);
            dom.setStyle(MaterialWalkthrough._wrapper, { display : 'block' });

            MaterialWalkthrough._renderFrame(target, () => {
                dom.addClass(MaterialWalkthrough._wrapper, 'opened');
                MaterialWalkthrough._renderContent(target, () => {
                    dom.setStyle(MaterialWalkthrough._contentWrapper, { display : 'block' });
                });

                // Pequeno XGH
                MaterialWalkthrough._renderContent(target, () => {
                  dom.setStyle(MaterialWalkthrough._contentWrapper, { display : 'block' });
                });
            });
        });

        _log('MSG', 'Walk created. Calling onSet() (if exists)');
        if (!!walkPoint.onSet) walkPoint.onSet();
    }

    /***
     * Create the function that updates the walker to a target
     * @param {HTMLElement} target  The target to set the update function
     * @returns {function} Update handler to call in the listeners
     */
    static _createUpdateHandler(target) {
        _log('WALK_UPDATE', 'Creating UpdateHandler for #' +target.id);

        const updateHandler = () => {
            _log('MSG', 'Updating and rendering');
            MaterialWalkthrough._locateTarget(target, () => {
                MaterialWalkthrough._renderFrame(target, () => {
                    MaterialWalkthrough._renderContent(target);
                });
            });
        };
        updateHandler.toString = () => {
            return 'updateHandler -> #' + target.id;
        };
        return updateHandler;
    }

    /***
     * Setup the update listeners (onResize, MutationObserver) and the close callback.
     * @param {HTMLElement} target The target to set the listeners
     * @param {function} onClose Close callback
     */
    static _setupListeners(target, onClose) {
        if(!!MaterialWalkthrough._instance.updateHandler) MaterialWalkthrough._flushListeners();
        MaterialWalkthrough._instance.updateHandler = MaterialWalkthrough._createUpdateHandler(target);

        window.addEventListener('resize', MaterialWalkthrough._instance.updateHandler);
        MaterialWalkthrough._instance.mutationObserver = new MutationObserver(MaterialWalkthrough._instance.updateHandler);
        //MaterialWalkthrough._instance.mutationObserver.observe(document.body, { childList: true, subtree: true });

        MaterialWalkthrough._actionButton.addEventListener('click', function actionCallback() {
            if (!!onClose) onClose();
            if (!!MaterialWalkthrough._instance.points && !!MaterialWalkthrough._instance.points[MaterialWalkthrough._instance.currentIndex + 1]) {
                MaterialWalkthrough._instance.currentIndex++;
                MaterialWalkthrough._setWalker(
                    MaterialWalkthrough._instance.points[MaterialWalkthrough._instance.currentIndex]
                );
            } else {
                MaterialWalkthrough._instance.currentIndex = 0;
                MaterialWalkthrough._instance.points = null;
                if(MaterialWalkthrough._instance.onCloseCallback) MaterialWalkthrough._instance.onCloseCallback();
                MaterialWalkthrough._instance.onCloseCallback = null;
                MaterialWalkthrough.closeWalker();
            }
            MaterialWalkthrough._actionButton.removeEventListener('click', actionCallback);
        });
    }

    /***
     * Clean the listeners with the actual updateHandler
     */
    static _flushListeners() {
        _log('WALK_UPDATER', 'Flushing handlers\n' + MaterialWalkthrough._instance.updateHandler);
        if(!!MaterialWalkthrough._instance.mutationObserver) MaterialWalkthrough._instance.mutationObserver.disconnect();
        MaterialWalkthrough._instance.mutationObserver = null;
        window.removeEventListener('resize', MaterialWalkthrough._instance.updateHandler);
    }

    /***
     * Set the properties for the walk.
     * @param {string} content The content that will be displayed in the walk
     * @param {string} color A CSS valid color
     * @param {string} acceptText The text that will be displayed in the accept button
     */
    static _setProperties(content, color, acceptText) {
        color = !!color ? color : MaterialWalkthrough.DEFAULT_COLOR;
        dom.setStyle(MaterialWalkthrough._wrapper, { borderColor: color });
        MaterialWalkthrough._content.innerHTML = content;
        MaterialWalkthrough._actionButton.innerHTML = acceptText || MaterialWalkthrough.DEFAULT_ACCEPT_TEXT;
    }

    /***
     * Move the Walker to a target
     * @param {HTMLElement} target
     * @param {function} locateCallback
     */
    static _locateTarget(target, locateCallback) {
        const top = target.offsetTop;
        const windowHeight = window.innerHeight;

        // TODO: Animate Scroll
        const YCoordinate = top - (windowHeight / 2);


        _log('WALK_LOCK', 'Moving Scroll to:', top);
        //window.scrollTo(0, YCoordinate);
        setTimeout(() => window.scrollTo(0, YCoordinate), 500);

        // TODO: Timeout on callback
        if (locateCallback) locateCallback();
    }

    // TODO: _renderFrame to renderWrapper
    static _renderFrame(target, renderCallback) {
        const position = { top: target.offsetTop, left: target.offsetLeft };
        const { height, width } = target.getClientRects()[0];

        let holeSize = height > width ? height : width; // Catch the biggest measure
        // Adjust with default min measure if it not higher than it
        if (holeSize < MaterialWalkthrough.MIN_SIZE) holeSize = MaterialWalkthrough.MIN_SIZE;
        _log('WALK_LOCK', 'Walk hole size ' +holeSize+ 'px');

        dom.setStyle(MaterialWalkthrough._wrapper, {
            height: (holeSize + MaterialWalkthrough.GUTTER) + 'px',
            width: (holeSize + MaterialWalkthrough.GUTTER) + 'px',

            marginLeft: -((holeSize + MaterialWalkthrough.GUTTER) / 2) + 'px',
            marginTop: -((holeSize + MaterialWalkthrough.GUTTER) / 2) + 'px',

            left: (position.left + (width / 2)) + 'px',
            top: (position.top + (height / 2)) + 'px',
        });

        setTimeout(function () {
            renderCallback();
        }, MaterialWalkthrough.TRANSITION_DURATION + 50);
    }

    static _renderContent(target, renderCallback) {
        const position = target.getBoundingClientRect(); // target.getClientRects()[0];
        console.log(position);

        const itCanBeRenderedInRight =
            position.x + (MaterialWalkthrough._wrapper.offsetWidth - MaterialWalkthrough.GUTTER)
            + MaterialWalkthrough._contentWrapper.offsetWidth < window.innerWidth;
        const itCanBeRenderedInLeft = (position.x - MaterialWalkthrough.GUTTER) - MaterialWalkthrough._contentWrapper.offsetWidth > 0;

        const itCanBeRenderedInTop =
            MaterialWalkthrough._wrapper.getBoundingClientRect().y
            - MaterialWalkthrough._contentWrapper.offsetHeight > 0;
        const itCanBeRenderedInBottom =
            MaterialWalkthrough._wrapper.getBoundingClientRect().y
            + MaterialWalkthrough._contentWrapper.offsetHeight + MaterialWalkthrough._contentWrapper.offsetHeight
            < window.innerHeight;

        _log('WALK_CONTENT', 'itCanBeRenderedInRight: ' +itCanBeRenderedInRight);
        _log('WALK_CONTENT', 'itCanBeRenderedInLeft: ' +itCanBeRenderedInLeft);
        _log('WALK_CONTENT', 'itCanBeRenderedInTop: ' +itCanBeRenderedInTop);
        _log('WALK_CONTENT', 'itCanBeRenderedInBottom: ' +itCanBeRenderedInBottom);

        let left = '100%';
        let top = '100%';
        let marginTop = 0;
        let marginLeft = 0;
        let textAlign = 'left';

        if (!itCanBeRenderedInRight) {
            left = itCanBeRenderedInLeft ? '-'+ MaterialWalkthrough._contentWrapper.offsetWidth +'px'
                : (itCanBeRenderedInBottom ? '0%':  '25%');
            textAlign = itCanBeRenderedInLeft ? 'right' : 'center';
            marginTop = itCanBeRenderedInLeft ? 0 : (itCanBeRenderedInBottom ? '20px' : '-20px');
        }
        if (!itCanBeRenderedInBottom) {
            top = itCanBeRenderedInTop ? '-'+ MaterialWalkthrough._contentWrapper.offsetHeight +'px'
                : MaterialWalkthrough._wrapper.offsetHeight / 2 - MaterialWalkthrough._contentWrapper.offsetHeight / 2 + 'px';
            marginLeft = itCanBeRenderedInTop ? 0 : (!itCanBeRenderedInRight ? '-20px' : '20px');
        }
        dom.setStyle(MaterialWalkthrough._contentWrapper, { left, top, textAlign, marginTop, marginLeft });

        if(renderCallback) renderCallback();
    }

    static walk(walkPoints, callback) {
        MaterialWalkthrough._instance.points = walkPoints;
        MaterialWalkthrough._instance.currentIndex = 0;
        MaterialWalkthrough._instance.onCloseCallback = callback;
        MaterialWalkthrough.to(walkPoints[0]);
    };

    /***
     * Open the walker to a walkpoint.
     * @param {WalkPoint} walkPoint The configuration of the walkpoint
     */
    static to(walkPoint) {
        ScrollManager.disable();
        if (!MaterialWalkthrough.isInitialized) MaterialWalkthrough._init();
        dom.removeClass(MaterialWalkthrough._wrapper, 'closed');
        MaterialWalkthrough._setWalker(walkPoint);
    }

    /***
     * Close the walker and flush its Listeners.
     */
    static closeWalker() {
        _log('MSG', 'Closing Walker');
        MaterialWalkthrough._flushListeners();
        ScrollManager.enable();

        dom.setStyle(MaterialWalkthrough._wrapper, { marginTop: '-500px', marginLeft: '-500px' });
        dom.addClass(MaterialWalkthrough._wrapper, 'closed');
        setTimeout(() => {
            dom.setStyle(MaterialWalkthrough._wrapper, { display: 'none' });
            dom.removeClass(MaterialWalkthrough._wrapper, 'opened');
            _log('MSG', 'Walker Closed!');
        }, MaterialWalkthrough.TRANSITION_DURATION);
    }
}
