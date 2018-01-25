(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.MaterialWalkthrough = factory());
}(this, (function () { 'use strict';

function __$styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css) { return }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

__$styleInject("/**\n * Copyright 2017 Esset Software LTD.\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\n\nbody {\n    margin: 0px; /* Having problems with getClientRects. Webkit apply 8px for maring in body. Reseting body */\n    position: relative; /* FIX FROM ISSUE #30 */\n}\n#walk-bounds {\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100vw;\n    height: 100%;\n    z-index: 1000;\n    overflow: hidden;\n    pointer-events: none;\n}\n/* END */\n\n#walk-wrapper {\n    pointer-events: all;\n    transform: translateZ(0);\n    position: absolute;\n    color: white;\n    z-index: 1000;\n    display: none;\n}\n\n#walk-wrapper.opened {\n    transition: 0.25s;\n}\n\n#walk-wrapper.closed {\n    height: 1000px !important;\n    width: 1000px !important;\n    opacity: 0;\n}\n\n#walk-wrapper.closed #walk-content-wrapper {\n    display: none;\n}\n\n#walk-wrapper:before {\n    content: '';\n    display: block;\n    position: absolute;\n    background: transparent;\n    border: solid 0vw;\n    border-radius: 50%;\n    border-color: inherit;\n    width: inherit;\n    height: inherit;\n    margin-top: 0vw;\n    margin-left: 0vw;\n    opacity: .9;\n    box-sizing: content-box !important;\n    transition: border-width 0.25s ease-in, margin 0.25s ease-in;\n}\n\n#walk-wrapper.opened:before{\n    border-width: 300vw;\n    margin-left: -300vw;\n    margin-top: -300vw;\n}\n\n#walk-wrapper:after {\n    content: ' ';\n    box-sizing: content-box;\n    position: absolute;\n    top: -1px;\n    left: -1px;\n    width: 100%;\n    height: 100%;\n    border: 1px solid white;\n    border-radius: 50%;\n    box-shadow: inset 0px 0px 10px rgba(0,0,0,0.5);\n}\n\n#walk-wrapper #walk-content-wrapper {\n    position: relative;\n    min-width: 200px;\n    width: 33vw;\n    font-family: 'Roboto', sans-serif;\n    font-size: 24px;\n\n    /* DEFAULT POSITION */\n    top: 100%;\n    left: 100%;\n}\n\n#walk-wrapper #walk-action {\n    height: 36px;\n    padding: 0 2rem;\n    margin-top: 10px;\n    background-color: rgba(255, 255, 255, 0.2);\n    border: 0;\n    border-radius: 2px;\n    letter-spacing: 1px;\n    font-size: 15px;\n    font-weight: bold;\n    text-transform: uppercase;\n    color: white;\n    display: inline-block;\n    flex-flow: initial;\n}\n\n#walk-wrapper #walk-action:hover {\n    background-color: rgba(255, 255, 255, 0.25);\n}", {});

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

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
    MSG: true,
    WALK_CONTENT: true,
    WALK_CONTENT_TOP: true,
    WALK_LOCK: true,
    WALK_SCROLL: true,
    ALL: true
};

function _log(context, message) {
    var _console;

    for (var _len = arguments.length, attrs = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        attrs[_key - 2] = arguments[_key];
    }

    if (!!_logenv[context] || _logenv.ALL) (_console = console).log.apply(_console, [context + ': ' + message].concat(attrs));
}

var dom = {
    get: function get$$1(target) {
        if (typeof target === 'string') return document.querySelector(target);
        return target;
    },
    setStyle: function setStyle(element, properties) {
        Object.keys(properties).forEach(function (val) {
            element.style[val] = properties[val];
        });
    },
    appendTo: function appendTo(element, content) {
        var tmpElt = document.createElement('div');
        tmpElt.innerHTML = content;
        element.append(tmpElt.children[0]);
    },
    removeClass: function removeClass(element, className) {
        element.classList.remove(className);
    },
    addClass: function addClass(element, className) {
        element.classList.add(className);
    }
};

// Locking scroll
// Thanks to @galambalazs
var ScrollManager = {
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

    preventDefault: function preventDefault(e) {
        e = e || window.event;
        if (e.preventDefault) e.preventDefault();
        e.returnValue = false;
    },
    preventDefaultForScrollKeys: function preventDefaultForScrollKeys(e) {
        if (ScrollManager.keys[e.keyCode]) {
            ScrollManager.preventDefault(e);
            return false;
        }
    },
    disable: function disable() {
        dom.setStyle(dom.get('html'), {
            'height': '100vh',
            'overflow': 'hidden'
        });
        var preventDefault = ScrollManager.preventDefault;
        var preventDefaultForScrollKeys = ScrollManager.preventDefaultForScrollKeys;
        if (window.addEventListener) // older FF
            window.addEventListener('DOMMouseScroll', preventDefault, false);
        window.onwheel = preventDefault; // modern standard
        window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
        window.ontouchmove = preventDefault; // mobile
        document.onkeydown = preventDefaultForScrollKeys;
    },
    enable: function enable() {
        dom.setStyle(dom.get('html'), {
            'height': '',
            'overflow': 'auto'
        });
        if (window.removeEventListener) window.removeEventListener('DOMMouseScroll', ScrollManager.preventDefault, false);
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

var MaterialWalkthrough = function () {
    function MaterialWalkthrough() {
        classCallCheck(this, MaterialWalkthrough);
    }

    createClass(MaterialWalkthrough, null, [{
        key: '_init',
        value: function _init() {
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

    }, {
        key: '_setWalker',
        value: function _setWalker(walkPoint) {
            var target = dom.get(walkPoint.target);
            _log('MSG', '-------------------------------------');
            _log('MSG', 'Setting a walk to #' + target.id);
            _log('WALK_SETUP', 'Properties:\n' + JSON.stringify(walkPoint, null, 2));

            MaterialWalkthrough._setupListeners(target, walkPoint.onClose);
            dom.setStyle(MaterialWalkthrough._contentWrapper, { display: 'none' });

            MaterialWalkthrough._locateTarget(target, function () {
                MaterialWalkthrough._setProperties(walkPoint.content, walkPoint.color, walkPoint.acceptText);
                dom.setStyle(MaterialWalkthrough._wrapper, { display: 'block' });

                MaterialWalkthrough._renderFrame(target, function () {
                    dom.addClass(MaterialWalkthrough._wrapper, 'opened');
                    MaterialWalkthrough._renderContent(target, function () {
                        dom.setStyle(MaterialWalkthrough._contentWrapper, { display: 'block' });
                    });

                    // Pequeno XGH
                    MaterialWalkthrough._renderContent(target, function () {
                        dom.setStyle(MaterialWalkthrough._contentWrapper, { display: 'block' });
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

    }, {
        key: '_createUpdateHandler',
        value: function _createUpdateHandler(target) {
            _log('WALK_UPDATE', 'Creating UpdateHandler for #' + target.id);

            var updateHandler = function updateHandler() {
                _log('MSG', 'Updating and rendering');
                MaterialWalkthrough._locateTarget(target, function () {
                    MaterialWalkthrough._renderFrame(target, function () {
                        MaterialWalkthrough._renderContent(target);
                    });
                });
            };
            updateHandler.toString = function () {
                return 'updateHandler -> #' + target.id;
            };
            return updateHandler;
        }

        /***
         * Setup the update listeners (onResize, MutationObserver) and the close callback.
         * @param {HTMLElement} target The target to set the listeners
         * @param {function} onClose Close callback
         */

    }, {
        key: '_setupListeners',
        value: function _setupListeners(target, onClose) {
            if (!!MaterialWalkthrough._instance.updateHandler) MaterialWalkthrough._flushListeners();
            MaterialWalkthrough._instance.updateHandler = MaterialWalkthrough._createUpdateHandler(target);

            window.addEventListener('resize', MaterialWalkthrough._instance.updateHandler);
            MaterialWalkthrough._instance.mutationObserver = new MutationObserver(MaterialWalkthrough._instance.updateHandler);
            MaterialWalkthrough._instance.mutationObserver.observe(document.body, { childList: true, subtree: true });

            MaterialWalkthrough._actionButton.addEventListener('click', function actionCallback() {
                if (!!onClose) onClose();
                if (!!MaterialWalkthrough._instance.points && !!MaterialWalkthrough._instance.points[MaterialWalkthrough._instance.currentIndex + 1]) {
                    MaterialWalkthrough._instance.currentIndex++;
                    MaterialWalkthrough._setWalker(MaterialWalkthrough._instance.points[MaterialWalkthrough._instance.currentIndex]);
                } else {
                    MaterialWalkthrough._instance.currentIndex = 0;
                    MaterialWalkthrough._instance.points = null;
                    if (MaterialWalkthrough._instance.onCloseCallback) MaterialWalkthrough._instance.onCloseCallback();
                    MaterialWalkthrough._instance.onCloseCallback = null;
                    MaterialWalkthrough.closeWalker();
                }
                MaterialWalkthrough._actionButton.removeEventListener('click', actionCallback);
            });
        }

        /***
         * Clean the listeners with the actual updateHandler
         */

    }, {
        key: '_flushListeners',
        value: function _flushListeners() {
            _log('WALK_UPDATER', 'Flushing handlers\n' + MaterialWalkthrough._instance.updateHandler);
            if (!!MaterialWalkthrough._instance.mutationObserver) MaterialWalkthrough._instance.mutationObserver.disconnect();
            MaterialWalkthrough._instance.mutationObserver = null;
            window.removeEventListener('resize', MaterialWalkthrough._instance.updateHandler);
        }

        /***
         * Set the properties for the walk.
         * @param {string} content The content that will be displayed in the walk
         * @param {string} color A CSS valid color
         * @param {string} acceptText The text that will be displayed in the accept button
         */

    }, {
        key: '_setProperties',
        value: function _setProperties(content, color, acceptText) {
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

    }, {
        key: '_locateTarget',
        value: function _locateTarget(target, locateCallback) {
            var top = target.offsetTop;
            var windowHeight = window.innerHeight;
            var maxScrollValue = MaterialWalkthrough.CURRENT_DOCUMENT_HEIGHT - window.innerHeight;

            var _target$getClientRect = target.getClientRects()[0],
                height = _target$getClientRect.height,
                width = _target$getClientRect.width;

            var holeSize = height > width ? height : width;
            var YCoordinate = top - windowHeight / 2 + holeSize / 2;
            var secureYCoordinate = YCoordinate > maxScrollValue ? maxScrollValue : YCoordinate;

            _log('WALK_LOCK', 'Moving Scroll to:', secureYCoordinate);
            _log('WALK_LOCK', 'windowHeight:', windowHeight);
            setTimeout(function () {
                return window.scrollTo(0, secureYCoordinate);
            }, 0);

            // TODO: Timeout on callback
            if (locateCallback) locateCallback();
        }

        // TODO: _renderFrame to renderWrapper

    }, {
        key: '_renderFrame',
        value: function _renderFrame(target, renderCallback) {
            // HAVING ISSUES IN SOME TESTS
            // const position = { top: target.offsetTop, left: target.offsetLeft };

            /* @TODO: Can be simplified. Duplied usage. */
            var _target$getClientRect2 = target.getClientRects()[0],
                height = _target$getClientRect2.height,
                width = _target$getClientRect2.width,
                top = _target$getClientRect2.top,
                left = _target$getClientRect2.left;


            var holeSize = height > width ? height : width; // Catch the biggest measure
            // Adjust with default min measure if it not higher than it
            if (holeSize < MaterialWalkthrough.MIN_SIZE) holeSize = MaterialWalkthrough.MIN_SIZE;
            _log('WALK_LOCK', 'Walk hole size ' + holeSize + 'px');

            var positions = {
                height: holeSize + MaterialWalkthrough.GUTTER + 'px',
                width: holeSize + MaterialWalkthrough.GUTTER + 'px',

                marginLeft: -((holeSize + MaterialWalkthrough.GUTTER) / 2) + 'px',
                marginTop: -((holeSize + MaterialWalkthrough.GUTTER) / 2) + 'px',

                left: left + width / 2 + 'px',
                top: top + height / 2 + 'px'
            };
            dom.setStyle(MaterialWalkthrough._wrapper, positions);
            _log('WALK_LOCK', 'Positioning \n' + JSON.stringify(positions, 2));

            setTimeout(function () {
                renderCallback();
            }, MaterialWalkthrough.TRANSITION_DURATION + 50);
        }
    }, {
        key: '_renderContent',
        value: function _renderContent(target, renderCallback) {
            var position = MaterialWalkthrough._wrapper.getBoundingClientRect(); // target.getBoundingClientRect(); // target.getClientRects()[0];

            var itCanBeRenderedInRight = position.x + (MaterialWalkthrough._wrapper.offsetWidth - MaterialWalkthrough.GUTTER) + MaterialWalkthrough._contentWrapper.offsetWidth < window.innerWidth;
            var itCanBeRenderedInLeft = position.x - MaterialWalkthrough.GUTTER - MaterialWalkthrough._contentWrapper.offsetWidth > 0;

            var itCanBeRenderedInTop = position.y - MaterialWalkthrough._contentWrapper.offsetHeight > 0;
            var itCanBeRenderedInBottom = position.y + MaterialWalkthrough._contentWrapper.offsetHeight + MaterialWalkthrough._contentWrapper.offsetHeight < window.innerHeight;

            _log('WALK_CONTENT', 'itCanBeRenderedInRight: ' + itCanBeRenderedInRight);
            _log('WALK_CONTENT', 'itCanBeRenderedInLeft: ' + itCanBeRenderedInLeft);
            _log('WALK_CONTENT', 'itCanBeRenderedInTop: ' + itCanBeRenderedInTop);
            _log('WALK_CONTENT', 'itCanBeRenderedInBottom: ' + itCanBeRenderedInBottom);

            var left = '100%';
            var top = '100%';
            var marginTop = 0;
            var marginLeft = 0;
            var textAlign = 'left';

            if (!itCanBeRenderedInRight) {
                left = itCanBeRenderedInLeft ? '-' + MaterialWalkthrough._contentWrapper.offsetWidth + 'px' : 'calc(50% - 100px)';
                textAlign = itCanBeRenderedInLeft ? 'right' : 'center';
                marginTop = itCanBeRenderedInLeft ? 0 : itCanBeRenderedInBottom ? '20px' : '-20px';
            }
            if (!itCanBeRenderedInBottom) {
                top = itCanBeRenderedInTop ? '-' + MaterialWalkthrough._contentWrapper.offsetHeight + 'px' : MaterialWalkthrough._wrapper.offsetHeight / 2 - MaterialWalkthrough._contentWrapper.offsetHeight / 2 + 'px';
                marginLeft = itCanBeRenderedInTop ? 0 : !itCanBeRenderedInRight ? '-20px' : '20px';
            }
            dom.setStyle(MaterialWalkthrough._contentWrapper, { left: left, top: top, textAlign: textAlign, marginTop: marginTop, marginLeft: marginLeft });

            if (renderCallback) renderCallback();
        }
    }, {
        key: 'walk',
        value: function walk(walkPoints, callback) {
            MaterialWalkthrough._instance.points = walkPoints;
            MaterialWalkthrough._instance.currentIndex = 0;
            MaterialWalkthrough._instance.onCloseCallback = callback;
            MaterialWalkthrough.to(walkPoints[0]);
        }
    }, {
        key: 'to',


        /***
         * Open the walker to a walkpoint.
         * @param {WalkPoint} walkPoint The configuration of the walkpoint
         */
        value: function to(walkPoint) {
            MaterialWalkthrough.CURRENT_DOCUMENT_HEIGHT = document.querySelector('html').offsetHeight;
            ScrollManager.disable();
            if (!MaterialWalkthrough.isInitialized) MaterialWalkthrough._init();
            dom.removeClass(MaterialWalkthrough._wrapper, 'closed');
            MaterialWalkthrough._setWalker(walkPoint);
        }

        /***
         * Close the walker and flush its Listeners.
         */

    }, {
        key: 'closeWalker',
        value: function closeWalker() {
            _log('MSG', 'Closing Walker');
            MaterialWalkthrough._flushListeners();
            ScrollManager.enable();

            dom.setStyle(MaterialWalkthrough._wrapper, { marginTop: '-500px', marginLeft: '-500px' });
            dom.addClass(MaterialWalkthrough._wrapper, 'closed');
            setTimeout(function () {
                dom.setStyle(MaterialWalkthrough._wrapper, { display: 'none' });
                dom.removeClass(MaterialWalkthrough._wrapper, 'opened');
                _log('MSG', 'Walker Closed!');
            }, MaterialWalkthrough.TRANSITION_DURATION);
        }
    }]);
    return MaterialWalkthrough;
}();

MaterialWalkthrough.CURRENT_DOCUMENT_HEIGHT = 0;
MaterialWalkthrough.DEFAULT_COLOR = '#2196F3';
MaterialWalkthrough.DEFAULT_ACCEPT_TEXT = 'Ok';
MaterialWalkthrough.TRANSITION_DURATION = 500;
MaterialWalkthrough.MIN_SIZE = 60;
MaterialWalkthrough.GUTTER = 20;
MaterialWalkthrough.ELEMENT_TEMPLATE = '<div id=\'walk-wrapper\'>\n            <div id=\'walk-content-wrapper\'>\n                <div id=\'walk-content\'></div>\n                <button id=\'walk-action\'></button>\n            </div>\n        </div>';
MaterialWalkthrough.isInitialized = false;
MaterialWalkthrough._wrapper = null;
MaterialWalkthrough._contentWrapper = null;
MaterialWalkthrough._content = null;
MaterialWalkthrough._actionButton = null;
MaterialWalkthrough._instance = {
    updateHandler: null,
    mutationObserver: null,
    points: null,
    currentIndex: null,
    onCloseCallback: null
};

return MaterialWalkthrough;

})));
//# sourceMappingURL=material-walkthrough.js.map
