(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.MaterialWalkthrough = factory());
}(this, (function () { 'use strict';

function __$styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

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
 * Utils used to manipulate DOM.
 */
var DOMUtils = function () {
  function DOMUtils() {
    classCallCheck(this, DOMUtils);
  }

  createClass(DOMUtils, null, [{
    key: 'get',


    /**
     * Query for a element in the Document with querySelector. If the target is already a HTMLElement, it bypass.
     * @param {(string|HTMLElement)} target THe query in CSS selector syntax to match a Element from Document. Or it can be an element already, that will bypass.
     * @returns {HTMLElement}
     */
    value: function get$$1(target) {
      if (typeof target === 'string') return document.querySelector(target);
      return target;
    }

    /**
     * Set a new style to an HTMLElement.
     * @param {HTMLElement} element The target element to apply the style.
     * @param properties
     */

  }, {
    key: 'setStyle',
    value: function setStyle(element, properties) {
      Object.keys(properties).forEach(function (val) {
        element.style[val] = properties[val];
      });
    }

    /**
     * Append a new element to an target using HTMLString.
     * @param {HTMLElement} element The target element.
     * @param {HTMLString|string} content A valid string based on HTMLString to append into the element.
     */

  }, {
    key: 'appendTo',
    value: function appendTo(element, content) {
      var tmpElt = document.createElement('div');
      tmpElt.innerHTML = content;
      element.appendChild(tmpElt.children[0]);
    }

    /**
     * Remove a specific class from classList of a target element.
     * @param {HTMLElement} element The target element.
     * @param {string} className The class to remove.
     */

  }, {
    key: 'removeClass',
    value: function removeClass(element, className) {
      element.classList.remove(className);
    }

    /**
     * Add a specific class from classList of a target element.
     * @param {HTMLElement} element The target element.
     * @param {string} className The class to add.
     */

  }, {
    key: 'addClass',
    value: function addClass(element, className) {
      element.classList.add(className);
    }
  }]);
  return DOMUtils;
}();

/**
 * Controls the state of scroll actions.
 * Thanks to @galambalazs.
 */

var ScrollManager = function () {
  function ScrollManager() {
    classCallCheck(this, ScrollManager);
  }

  createClass(ScrollManager, null, [{
    key: 'preventDefault',
    value: function preventDefault(e) {
      e = e || window.event;
      if (e.preventDefault) e.preventDefault();
      e.returnValue = false;
    }

    /**
     * A map object that list, enable/disable each keys that manipulate the scroll into the window.
     * left: 37, up: 38, right: 39, down: 40,
     * spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
     * @type {object}
     */

  }, {
    key: 'preventDefaultForScrollKeys',
    value: function preventDefaultForScrollKeys(e) {
      if (ScrollManager.keys[e.keyCode]) {
        ScrollManager.preventDefault(e);
        return false;
      }
    }

    /**
     * Override the main listeners, disabling the scroll for each enabled key in `keys` object.
     * Also, set `height: 100vh` and `overflow: hidden` in the `html` element, forcing the content size to match
     * with the window.
     */

  }, {
    key: 'disable',
    value: function disable() {
      DOMUtils.setStyle(DOMUtils.get('html'), {
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
    }

    /**
     * Reset the main listeners, enabling the scroll.
     * Also reset the html element styles assigned before in `disable` function.
     */

  }, {
    key: 'enable',
    value: function enable() {
      DOMUtils.setStyle(DOMUtils.get('html'), {
        'height': '',
        'overflow': 'auto'
      });
      if (window.removeEventListener) window.removeEventListener('DOMMouseScroll', ScrollManager.preventDefault, false);
      window.onmousewheel = document.onmousewheel = null;
      window.onwheel = null;
      window.ontouchmove = null;
      document.onkeydown = null;
    }
  }]);
  return ScrollManager;
}();

ScrollManager.keys = {
  37: 1,
  38: 1,
  39: 1,
  40: 1,
  32: 1,
  33: 1,
  34: 1
};

/**
 * Calculate brightness value by RGB or HEX color.
 * @param color (String) The color value in RGB or HEX (for example: #000000 || #000 || rgb(0,0,0) || rgba(0,0,0,0))
 * @returns (Number) The brightness value (dark) 0 ... 255 (light)
 */
function brightnessByColor(color) {
  var color = "" + color,
      isHEX = color.indexOf("#") == 0,
      isRGB = color.indexOf("rgb") == 0;
  if (isHEX) {
    var m = color.substr(1).match(color.length == 7 ? /(\S{2})/g : /(\S{1})/g);
    if (m) var r = parseInt(m[0], 16),
        g = parseInt(m[1], 16),
        b = parseInt(m[2], 16);
  }
  if (isRGB) {
    var m = color.match(/(\d+){3}/g);
    if (m) var r = m[0],
        g = m[1],
        b = m[2];
  }
  if (typeof r != "undefined") return (r * 299 + g * 587 + b * 114) / 1000;
}

__$styleInject("/**\n * Copyright 2017 Esset Software LTD.\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\n\nbody {\n    margin: 0px; /* Having problems with getClientRects. Webkit apply 8px for maring in body. Reseting body */\n    position: relative; /* FIX FROM ISSUE #30 */\n}\n#walk-bounds {\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100vw;\n    height: 100%;\n    z-index: 1000;\n    overflow: hidden;\n    pointer-events: none;\n}\n/* END */\n\n#walk-wrapper {\n    pointer-events: all;\n    transform: translateZ(0);\n    position: absolute;\n    color: white; /* @TODO: Decide the contrast color based on the bright of the main color */\n    z-index: 1000;\n    display: none;\n}\n#walk-wrapper.dark {\n  color: black;\n}\n\n#walk-wrapper.opened {\n    transition: 0.25s;\n}\n\n#walk-wrapper.closed {\n    height: 1000px !important;\n    width: 1000px !important;\n    opacity: 0;\n}\n\n#walk-wrapper.closed #walk-content-wrapper {\n    display: none;\n}\n\n#walk-wrapper:before {\n    content: '';\n    display: block;\n    position: absolute;\n    background: transparent;\n    border: solid 0vw;\n    border-radius: 50%;\n    border-color: inherit;\n    width: inherit;\n    height: inherit;\n    margin-top: 0vw;\n    margin-left: 0vw;\n    opacity: .9;\n    box-sizing: content-box !important;\n    transition: border-width 0.25s ease-in, margin 0.25s ease-in;\n}\n\n#walk-wrapper.opened:before {\n    border-width: 200vw;\n    margin-left: -200vw;\n    margin-top: -200vw;\n}\n\n#walk-wrapper:after {\n    content: ' ';\n    box-sizing: content-box;\n    position: absolute;\n    top: -1px;\n    left: -1px;\n    width: 100%;\n    height: 100%;\n    border: 1px solid white;\n    border-radius: 50%;\n    box-shadow: inset 0px 0px 10px rgba(0,0,0,0.5);\n}\n\n#walk-wrapper #walk-content-wrapper {\n    position: relative;\n    min-width: 200px;\n    width: 33vw;\n    font-family: 'Roboto', sans-serif;\n    font-size: 24px;\n    opacity: 1;\n    transition: 0.25s opacity;\n\n    /* DEFAULT POSITION */\n    top: 100%;\n    left: 100%;\n}\n\n#walk-wrapper:not(.opened) #walk-content-wrapper,\n#walk-wrapper.transiting #walk-content-wrapper {\n    opacity: 0;\n}\n\n#walk-wrapper #walk-action {\n    height: 36px;\n    padding: 0 2rem;\n    margin-top: 10px;\n    background-color: rgba(255, 255, 255, 0.2);\n    border: 0;\n    border-radius: 2px;\n    letter-spacing: 1px;\n    font-size: 15px;\n    font-weight: bold;\n    text-transform: uppercase;\n    color: white;\n    display: inline-block;\n    flex-flow: initial;\n}\n#walk-wrapper.dark #walk-action {\n  color: black;\n  background-color: rgba(0, 0, 0, 0.2);\n}\n\n#walk-wrapper #walk-action:hover {\n    background-color: rgba(255, 255, 255, 0.25);\n}\n#walk-wrapper.dark #walk-action:hover {\n  color: black;\n  background-color: rgba(0, 0, 0, 0.25);\n}\n\n\n/** small rules **/\n#walk-wrapper.opened.small:before {\n    border-width: 320px;\n    margin-left: -320px;\n    margin-top: -320px;\n}\n#walk-wrapper.small #walk-content-wrapper {\n  max-width: 300px;\n}\n\n#walk-wrapper.transiting.small:not(.animations-disabled) {\n    display: none !important;\n}\n\n@media (max-width: 750px) {\n    #walk-wrapper.opened.small:before {\n        border-width: 50vw;\n        margin-left: -50vw;\n        margin-top: -50vw;\n    }\n}\n\n/** animations-disabled rules **/\n#walk-wrapper.animations-disabled,\n#walk-wrapper.animations-disabled:before {\n    transition: height 0s, width 0s, top 0.25s, left 0.25s, opacity 0.25s;\n}\n\n#walk-wrapper.animations-disabled:before {\n    transition: 0.25s opacity;\n}\n\n#walk-wrapper.opened.animations-disabled:before {\n    opacity: .9;\n}\n\n#walk-wrapper.animations-disabled:before,\n#walk-wrapper.closed.animations-disabled:before,\n#walk-wrapper.closed.animations-disabled {\n    opacity: 0;\n}\n\n/*\nTODO: Make it responsible with layout breakpoints.\n    * The walk border\n    * The content text\n*/\n@media all and (max-width: 768px) {\n    #walk-wrapper #walk-content-wrapper {\n        max-width: 270px;\n        font-size: 18px;\n    }\n}\n", {});

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
/**
 * A key-value object that configs the log level of _log function.
 * @private
 */
var _logenv = {
  MSG: true,
  WALK_CONTENT: true,
  WALK_CONTENT_TOP: true,
  WALK_LOCK: true,
  WALK_SCROLL: true,
  ALL: true
};

/**
 * Log with context based in _logenv.
 * @param {string} context The context to dispatch this log.
 * @param {string} message The verbose message.
 * @param {*} [attrs] Optional custom metadatas to display.
 * @private
 */
function _log(context, message) {
  var _console;

  for (var _len = arguments.length, attrs = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    attrs[_key - 2] = arguments[_key];
  }

  if (!!_logenv[context] || _logenv.ALL) (_console = console).log.apply(_console, [context + ': ' + message].concat(attrs));
}

/**
 * A class that configures an walkpoint.
 * @typedef {object} WalkPoint
 * @property {string|HTMLElement} target A selector or a pure Element that the walk will focus;
 * @property {string} content A HTML code that will be inserted on the walk-content container;
 * @property {string} [color] A HEX or a RGB/RGBA color that will paint the walk. #2196F3 is default;
 * @property {string} [acceptText] The text of the accept button of the walk;
 * @property {function} [onSet] A function that will be called when the walk content is setted;
 * @property {function} [onClose] A function that will be called when the walk is accepted;
 */

/**
 * A material tour (eg Inbox from Google) for your site, enhancing the UX.
 * Basic usage:
 * ``` js
 * import MaterialWalkthrough from '@essetwide/material-walkthrough';
 *
 * MaterialWalkthrough.walk([
 *   {
 *     target: '#example1',
 *     content: 'My First Walkthrough!',
 *     acceptText: 'YEAH!'
 *   }
 * ]);
 * ```
 * @license Apache License 2.0.
 * @copyright Esset Software LTD.
 */

var MaterialWalkthrough = function () {
  function MaterialWalkthrough() {
    classCallCheck(this, MaterialWalkthrough);
  }

  createClass(MaterialWalkthrough, null, [{
    key: '_init',


    /**
     * Initialize the component in the document, appending `ELEMENT_TEMPLATE`,
     * and initialize the element references (`_wrapper`, `_contentWrapper`, `_content`, `_actionButton`);
     * @private
     */


    /**
     * Caches the action button element.
     * @type {HTMLElement}
     * @private
     */


    /**
     * Caches the content text wrapper element.
     * @type {HTMLElement}
     * @private
     */


    /**
     * Assigned to true after the component is settled into the document.
     * @type {boolean}
     */


    /**
     * Focus hole margin.
     * @type {number}
     */


    /**
     * Enable small wrapper of walkthrough.
     * @type {boolean}
     */


    /**
     * The duration of any animation. It needs to be the same as defined at the style.
     * Is used in some timeouts to wait a specific transition.
     * @type {number}
     */


    /**
     * Default color used if none is passed in the walkpoint.
     * It need to be a valid HEX or RGB color because it will be useful on contrast calculations.
     * @type {string}
     */

    /**
     * Cache the current height size of the document.
     * Calculated by `document.querySelector('html').offsetHeight` at `MaterialWalkthrough.to` method.
     * @type {number}
     */
    value: function _init() {
      DOMUtils.appendTo(DOMUtils.get('body'), MaterialWalkthrough.ELEMENT_TEMPLATE);
      MaterialWalkthrough._wrapper = DOMUtils.get('#walk-wrapper');
      MaterialWalkthrough._contentWrapper = DOMUtils.get('#walk-content-wrapper');
      MaterialWalkthrough._content = DOMUtils.get('#walk-content');
      MaterialWalkthrough._actionButton = DOMUtils.get('#walk-action');

      if (MaterialWalkthrough.DISABLE_HUGE_ANIMATIONS) DOMUtils.addClass(MaterialWalkthrough._wrapper, 'animations-disabled');
      if (MaterialWalkthrough.FORCE_SMALL_BORDER) DOMUtils.addClass(MaterialWalkthrough._wrapper, 'small');

      MaterialWalkthrough.isInitialized = true;
    }

    /***
     * Set the opened walker to a target with the properties from walkPoint.
     * @param {string|HTMLElement} target A query or a Element to target the walker
     * @param {WalkPoint} walkPoint The properties for this walker
     */


    /**
     * Contains the current walkthrough configuration.
     * @type {{
     *   updateHandler: Function,
     *   mutationObserver: MutationObserver,
     *   points: Array<WalkPoint>,
     *   currentIndex: Integer,
     *   onCloseCallback: Function
     * }}
     * @private
     */


    /**
     * Caches the content text element.
     * @type {HTMLElement}
     * @private
     */


    /**
     * Caches the wrapper element.
     * @type {HTMLElement}
     * @private
     */


    /**
     * Main component template.
     * @type {string}
     */


    /**
     * Minimal size of focus hole.
     * @type {boolean}
     */


    // @TODO: Auto apply DISABLE_HUGE_ANIMATIONS=true in mobile enviroment.
    /**
     * Disable animations such as walk's moving and opening/closing. Only Opacity animations is used.
     * It is useful for mobile
     * Default is false.
     * @type {boolean}
     */


    /**
     * Default accept text if none is passed in the walkpoint.
     * @type {string}
     */


    /**
     * Cache the original meta theme-color to be set back when MaterialWalkthrough finish.
     * @type {string}
     */

  }, {
    key: '_setWalker',
    value: function _setWalker(walkPoint) {
      var target = DOMUtils.get(walkPoint.target);

      if (!target) {
        _log('_setWalker', 'Target ' + walkPoint.target + ' not found. Skiping to next WalkPoint');
        MaterialWalkthrough._next();
        return;
      }

      _log('MSG', '-------------------------------------');
      _log('MSG', 'Setting a walk to #' + target.id);
      _log('WALK_SETUP', 'Properties:\n' + JSON.stringify(walkPoint, null, 2));

      MaterialWalkthrough._setupListeners(target, walkPoint.onClose);

      MaterialWalkthrough._locateTarget(target, function () {
        MaterialWalkthrough._setProperties(walkPoint.content, walkPoint.color, walkPoint.acceptText);
        DOMUtils.setStyle(MaterialWalkthrough._wrapper, { display: 'block' });

        MaterialWalkthrough._renderFrame(target, function () {
          DOMUtils.addClass(MaterialWalkthrough._wrapper, 'opened');
          MaterialWalkthrough._renderContent(target, function () {
            DOMUtils.removeClass(MaterialWalkthrough._wrapper, 'transiting');
          });

          // Little XGH
          MaterialWalkthrough._renderContent(target, function () {
            DOMUtils.removeClass(MaterialWalkthrough._wrapper, 'transiting');
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
     * Check if is at the end and finish it or move to the next WalkPoint
     */

  }, {
    key: '_next',
    value: function _next() {
      var hasNext = !!MaterialWalkthrough._instance.points && !!MaterialWalkthrough._instance.points[MaterialWalkthrough._instance.currentIndex + 1];
      if (hasNext) {
        MaterialWalkthrough._instance.currentIndex++;
        MaterialWalkthrough._setWalker(MaterialWalkthrough._instance.points[MaterialWalkthrough._instance.currentIndex]);
      } else {
        MaterialWalkthrough._instance.currentIndex = 0;
        MaterialWalkthrough._instance.points = null;
        if (MaterialWalkthrough._instance.onCloseCallback) MaterialWalkthrough._instance.onCloseCallback();
        MaterialWalkthrough._instance.onCloseCallback = null;
        MaterialWalkthrough.closeWalker();
      }
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

        // Responsive metrics (According the style.css)
        DOMUtils.addClass(MaterialWalkthrough._wrapper, 'transiting');

        setTimeout(function () {
          MaterialWalkthrough._next();
        }, MaterialWalkthrough.TRANSITION_DURATION);

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
     * @param {string} color A HEX or a RGB/RGBA valid color
     * @param {string} acceptText The text that will be displayed in the accept button
     */

  }, {
    key: '_setProperties',
    value: function _setProperties(content, color, acceptText) {
      var borderColor = !!color ? color : MaterialWalkthrough.DEFAULT_COLOR;
      console.log(brightnessByColor(borderColor));

      var brightness = brightnessByColor(borderColor);
      if (
      // BLACK CONTRAST
      brightness == 127.916 // LIGHT BLUE 500
      || brightness == 122.966 // CYAN 600
      || brightness == 126.36 // TEAL 400
      || brightness == 134.569 || // GREEN 500
      // WHITE CONTRAST
      (brightness != 145.93 // PINK 300
      || brightness != 139.462 // PURPLE 300
      || brightness != 142.449) && // BROWN 300
      brightness > 138.872 // P&B AVR
      ) DOMUtils.addClass(MaterialWalkthrough._wrapper, 'dark');else DOMUtils.removeClass(MaterialWalkthrough._wrapper, 'dark');

      DOMUtils.setStyle(MaterialWalkthrough._wrapper, { borderColor: borderColor });
      MaterialWalkthrough._content.innerHTML = content;
      MaterialWalkthrough._actionButton.innerHTML = acceptText || MaterialWalkthrough.DEFAULT_ACCEPT_TEXT;
      if (!MaterialWalkthrough.FORCE_SMALL_BORDER) {
        var themeColor = DOMUtils.get('meta[name="theme-color"]');
        if (themeColor) themeColor.setAttribute('content', borderColor);
      }
    }

    // @TODO: Animate the scroll.
    /***
     * Centralize the scroll to a target.
     * @param {HTMLElement} target
     * @param {function} locateCallback
     */

  }, {
    key: '_locateTarget',
    value: function _locateTarget(target, locateCallback) {
      var targetBounding = target.getBoundingClientRect();
      var top = targetBounding.top;
      var maxScrollValue = MaterialWalkthrough.CURRENT_DOCUMENT_HEIGHT - window.innerHeight;

      var YCoordinate = top - window.innerHeight / 2 + targetBounding.height / 2;
      var secureYCoordinate = YCoordinate > maxScrollValue ? maxScrollValue : YCoordinate;

      _log('WALK_LOCK', 'Moving Scroll to:', secureYCoordinate);
      _log('WALK_LOCK', 'windowHeight:', window.innerHeight);
      window.scrollTo(0, secureYCoordinate);

      // TODO: After the animation, timeout on callback
      if (locateCallback) locateCallback();
    }

    /**
     * Move the walk to a target.
     * @param {HTMLElement} target
     * @param {function} renderCallback
     * @private
     */

  }, {
    key: '_renderFrame',
    value: function _renderFrame(target, renderCallback) {
      // HAVING ISSUES WITH THIS WAY TO GET POSITION IN SOME TESTS
      var targetBounding = target.getBoundingClientRect();
      // Using this line.
      var height = targetBounding.height,
          width = targetBounding.width,
          left = targetBounding.left,
          top = targetBounding.top;


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
      DOMUtils.setStyle(MaterialWalkthrough._wrapper, positions);
      _log('WALK_LOCK', 'Positioning \n' + JSON.stringify(positions, 2));

      setTimeout(function () {
        renderCallback();
      }, MaterialWalkthrough.TRANSITION_DURATION / 2);
    }

    /**
     * Calculates the positions and render the content in the screen based in the space available around a target.
     * @param {HTMLElement} target
     * @param {function} renderCallback
     * @private
     */

  }, {
    key: '_renderContent',
    value: function _renderContent(target, renderCallback) {
      var position = MaterialWalkthrough._wrapper.getBoundingClientRect(); // target.getBoundingClientRect(); // target.getClientRects()[0];

      var itCanBeRenderedInRight = position.left + (MaterialWalkthrough._wrapper.offsetWidth - MaterialWalkthrough.GUTTER) + MaterialWalkthrough._contentWrapper.offsetWidth < window.innerWidth;
      var itCanBeRenderedInLeft = position.left + MaterialWalkthrough.GUTTER - MaterialWalkthrough._contentWrapper.offsetWidth > 0;

      var itCanBeRenderedInTop = position.top - MaterialWalkthrough._contentWrapper.offsetHeight > 0;
      var itCanBeRenderedInBottom = position.top + MaterialWalkthrough._contentWrapper.offsetHeight + MaterialWalkthrough._wrapper.offsetHeight < window.innerHeight;

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
      DOMUtils.setStyle(MaterialWalkthrough._contentWrapper, { left: left, top: top, textAlign: textAlign, marginTop: marginTop, marginLeft: marginLeft });

      if (renderCallback) renderCallback();
    }

    /***
     * Do a walkthrough to a set of walkpoints.
     * @param {Array<WalkPoint>} walkPoints A list of each walkpoint to move the walktrough.
     * @param {function} callback Callback called when the walkthrough is closed.
     */

  }, {
    key: 'walk',
    value: function walk(walkPoints, callback) {
      MaterialWalkthrough._instance.points = walkPoints;
      MaterialWalkthrough._instance.currentIndex = 0;
      MaterialWalkthrough._instance.onCloseCallback = callback;
      if (document.querySelector('meta[name="theme-color"]')) MaterialWalkthrough.ORIGINAL_THEME_COLOR = document.querySelector('meta[name="theme-color"]').getAttribute('content');else {
        MaterialWalkthrough.ORIGINAL_THEME_COLOR = null;
        var meta = document.createElement('meta');
        meta.name = "theme-color";
        meta.content = "";
        document.querySelector('head').appendChild(meta);
      }
      MaterialWalkthrough.to(walkPoints[0]);
    }
  }, {
    key: 'to',


    /***
     * Open the walkthrough to a single walkpoint.
     * @param {WalkPoint} walkPoint The configuration of the walkpoint
     */
    value: function to(walkPoint) {
      MaterialWalkthrough.CURRENT_DOCUMENT_HEIGHT = document.querySelector('html').offsetHeight;
      ScrollManager.disable();
      if (!MaterialWalkthrough.isInitialized) MaterialWalkthrough._init();
      DOMUtils.removeClass(MaterialWalkthrough._wrapper, 'closed');
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

      var themeColor = DOMUtils.get('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute('content', MaterialWalkthrough.ORIGINAL_THEME_COLOR);

      // This will centralize the walk while it animate the hole opening with 1000px size.
      DOMUtils.setStyle(MaterialWalkthrough._wrapper, { marginTop: '-500px', marginLeft: '-500px' });
      DOMUtils.addClass(MaterialWalkthrough._wrapper, 'closed');
      setTimeout(function () {
        DOMUtils.setStyle(MaterialWalkthrough._wrapper, { display: 'none' });
        DOMUtils.removeClass(MaterialWalkthrough._wrapper, 'opened');
        DOMUtils.removeClass(MaterialWalkthrough._wrapper, 'transiting');
        _log('MSG', 'Walker Closed!');
      }, MaterialWalkthrough.TRANSITION_DURATION);
    }
  }]);
  return MaterialWalkthrough;
}();

MaterialWalkthrough.CURRENT_DOCUMENT_HEIGHT = 0;
MaterialWalkthrough.ORIGINAL_THEME_COLOR = null;
MaterialWalkthrough.DEFAULT_COLOR = '#2196F3';
MaterialWalkthrough.DEFAULT_ACCEPT_TEXT = 'Ok';
MaterialWalkthrough.TRANSITION_DURATION = 500;
MaterialWalkthrough.DISABLE_HUGE_ANIMATIONS = false;
MaterialWalkthrough.FORCE_SMALL_BORDER = false;
MaterialWalkthrough.MIN_SIZE = 60;
MaterialWalkthrough.GUTTER = 20;
MaterialWalkthrough.ELEMENT_TEMPLATE = '<div id=\'walk-wrapper\' class=\'' + (MaterialWalkthrough.DISABLE_HUGE_ANIMATIONS ? 'animations-disabled' : '') + ' ' + (MaterialWalkthrough.FORCE_SMALL_BORDER ? 'small' : '') + '\'>\n      <div id=\'walk-content-wrapper\'>\n        <div id=\'walk-content\'></div>\n        <button id=\'walk-action\'></button>\n      </div>\n    </div>';
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
