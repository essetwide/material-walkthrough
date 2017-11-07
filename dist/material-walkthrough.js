(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.MaterialWalkthrough = factory());
}(this, (function () { 'use strict';

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
        if (typeof target === 'string') target = document.querySelector(target);
        return target;
    },
    setStyle: function setStyle(element, properties) {
        Object.keys(properties).forEach(function (val) {
            element.style[val] = properties[val];
        });
    },
    appendTo: function appendTo(element, content) {
        element.innerHTML += content;
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
            //MaterialWalkthrough._instance.mutationObserver.observe(document.body, { childList: true, subtree: true });

            MaterialWalkthrough._actionButton.addEventListener('click', function actionCallback() {
                if (!!onClose) onClose();
                if (!!MaterialWalkthrough._instance.points && !!MaterialWalkthrough._instance.points[MaterialWalkthrough._instance.currentIndex + 1]) {
                    MaterialWalkthrough._instance.currentIndex++;
                    MaterialWalkthrough._setWalker(MaterialWalkthrough._instance.points[MaterialWalkthrough._instance.currentIndex].target, MaterialWalkthrough._instance.points[MaterialWalkthrough._instance.currentIndex]);
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
            MaterialWalkthrough._actionButton.innerHTML = acceptText;
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

            // TODO: Animate Scroll
            var YCoordinate = top - windowHeight / 2;

            _log('WALK_LOCK', 'Moving Scroll to:', top);
            //window.scrollTo(0, YCoordinate);
            setTimeout(function () {
                window.scrollTo(0, YCoordinate);
            }, 500);

            // TODO: Timeout on callback
            if (locateCallback) locateCallback();
        }

        // TODO: _renderFrame to renderWrapper

    }, {
        key: '_renderFrame',
        value: function _renderFrame(target, renderCallback) {
            var position = { top: target.offsetTop, left: target.offsetLeft };
            var _target$getClientRect = target.getClientRects()[0],
                height = _target$getClientRect.height,
                width = _target$getClientRect.width;


            var holeSize = height > width ? height : width; // Catch the biggest measure
            // Adjust with default min measure if it not higher than it
            if (holeSize < MaterialWalkthrough.MIN_SIZE) holeSize = MaterialWalkthrough.MIN_SIZE;
            _log('WALK_LOCK', 'Walk hole size ' + holeSize + 'px');

            dom.setStyle(MaterialWalkthrough._wrapper, {
                height: holeSize + MaterialWalkthrough.GUTTER + 'px',
                width: holeSize + MaterialWalkthrough.GUTTER + 'px',

                marginLeft: -((holeSize + MaterialWalkthrough.GUTTER) / 2) + 'px',
                marginTop: -((holeSize + MaterialWalkthrough.GUTTER) / 2) + 'px',

                left: position.left + width / 2 + 'px',
                top: position.top + height / 2 + 'px'
            });

            setTimeout(function () {
                renderCallback();
            }, MaterialWalkthrough.TRANSITION_DURATION / 2);
        }
    }, {
        key: '_renderContent',
        value: function _renderContent(target, renderCallback) {
            var position = target.getBoundingClientRect(); // getClientRects()

            var itCanBeRenderedInRight = position.left + (MaterialWalkthrough._wrapper.offsetWidth - MaterialWalkthrough.GUTTER) + MaterialWalkthrough._contentWrapper.offsetWidth < window.innerWidth;
            var itCanBeRenderedInLeft = position.left - MaterialWalkthrough.GUTTER - MaterialWalkthrough._contentWrapper.offsetWidth > 0;

            var itCanBeRenderedInTop = MaterialWalkthrough._wrapper.getBoundingClientRect().top - MaterialWalkthrough._contentWrapper.offsetHeight > 0;
            var itCanBeRenderedInBottom = MaterialWalkthrough._wrapper.getBoundingClientRect().top + MaterialWalkthrough._contentWrapper.offsetHeight + MaterialWalkthrough._contentWrapper.offsetHeight < window.innerHeight;

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
                left = itCanBeRenderedInLeft ? '-' + MaterialWalkthrough._contentWrapper.offsetWidth + 'px' : itCanBeRenderedInBottom ? '0%' : '25%';
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

MaterialWalkthrough.DEFAULT_COLOR = '#2196F3';
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
