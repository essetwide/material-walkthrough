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
import dom from './DOMUtils';
import ScrollManager from './ScrollManager';
import { brightnessByColor } from './utils';
import './style.css';

/**
 * A key-value object that configs the log level of _log function.
 * @private
 */
const _logenv = {
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
function _log(context, message, ...attrs) {
  if (!!_logenv[context] || _logenv.ALL) console.log(context + ': ' + message, ...attrs);
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
export default class MaterialWalkthrough {
  /**
   * Cache the current height size of the document.
   * Calculated by `document.querySelector('html').offsetHeight` at `MaterialWalkthrough.to` method.
   * @type {number}
   */
  static CURRENT_DOCUMENT_HEIGHT = 0;

  /**
   * Cache the original meta theme-color to be set back when MaterialWalkthrough finish.
   * @type {string}
   */
  static ORIGINAL_THEME_COLOR = null;

  /**
   * Default color used if none is passed in the walkpoint.
   * It need to be a valid HEX or RGB color because it will be useful on contrast calculations.
   * @type {string}
   */
  static DEFAULT_COLOR = '#2196F3';

  /**
   * Default accept text if none is passed in the walkpoint.
   * @type {string}
   */
  static DEFAULT_ACCEPT_TEXT = 'Ok';

  /**
   * The duration of any animation. It needs to be the same as defined at the style.
   * Is used in some timeouts to wait a specific transition.
   * @type {number}
   */
  static TRANSITION_DURATION = 500;

  // @TODO: Auto apply DISABLE_HUGE_ANIMATIONS=true in mobile enviroment.
  /**
   * Disable animations such as walk's moving and opening/closing. Only Opacity animations is used.
   * It is useful for mobile
   * Default is false.
   * @type {boolean}
   */
  static DISABLE_HUGE_ANIMATIONS = false;

  /**
   * Enable small wrapper of walkthrough.
   * @type {boolean}
   */
  static FORCE_SMALL_BORDER = false;

  /**
   * Minimal size of focus hole.
   * @type {boolean}
   */
  static MIN_SIZE = 60;

  /**
   * Focus hole margin.
   * @type {number}
   */
  static GUTTER = 20;

  /**
   * Main component template.
   * @type {string}
   */
  static ELEMENT_TEMPLATE =
    `<div id='walk-wrapper' class='${MaterialWalkthrough.DISABLE_HUGE_ANIMATIONS ? 'animations-disabled' : ''} ${MaterialWalkthrough.FORCE_SMALL_BORDER ? 'small' : ''}'>
      <div id='walk-content-wrapper'>
        <div id='walk-content'></div>
        <button id='walk-action'></button>
      </div>
    </div>`;

  /**
   * Assigned to true after the component is settled into the document.
   * @type {boolean}
   */
  static isInitialized = false;

  /**
   * Caches the wrapper element.
   * @type {HTMLElement}
   * @private
   */
  static _wrapper = null;

  /**
   * Caches the content text wrapper element.
   * @type {HTMLElement}
   * @private
   */
  static _contentWrapper = null;

  /**
   * Caches the content text element.
   * @type {HTMLElement}
   * @private
   */
  static _content = null;

  /**
   * Caches the action button element.
   * @type {HTMLElement}
   * @private
   */
  static _actionButton = null;

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
  static _instance = {
    updateHandler: null,
    mutationObserver: null,
    points: null,
    currentIndex: null,
    onCloseCallback: null,
  };

  /**
   * Initialize the component in the document, appending `ELEMENT_TEMPLATE`,
   * and initialize the element references (`_wrapper`, `_contentWrapper`, `_content`, `_actionButton`);
   * @private
   */
  static _init() {
    dom.appendTo(dom.get('body'), MaterialWalkthrough.ELEMENT_TEMPLATE);
    MaterialWalkthrough._wrapper = dom.get('#walk-wrapper');
    MaterialWalkthrough._contentWrapper = dom.get('#walk-content-wrapper');
    MaterialWalkthrough._content = dom.get('#walk-content');
    MaterialWalkthrough._actionButton = dom.get('#walk-action');

    if (MaterialWalkthrough.DISABLE_HUGE_ANIMATIONS) dom.addClass(MaterialWalkthrough._wrapper, 'animations-disabled');
    if (MaterialWalkthrough.FORCE_SMALL_BORDER) dom.addClass(MaterialWalkthrough._wrapper, 'small');

    MaterialWalkthrough.isInitialized = true;
  }

  /***
   * Set the opened walker to a target with the properties from walkPoint.
   * @param {string|HTMLElement} target A query or a Element to target the walker
   * @param {WalkPoint} walkPoint The properties for this walker
   */
  static _setWalker(walkPoint) {
    let target = dom.get(walkPoint.target);

    if (!target) {
      _log('_setWalker', 'Target ' + walkPoint.target + ' not found. Skiping to next WalkPoint');
      MaterialWalkthrough._next();
      return;
    }

    _log('MSG', '-------------------------------------');
    _log('MSG', 'Setting a walk to #' + target.id);
    _log('WALK_SETUP', 'Properties:\n' + JSON.stringify(walkPoint, null, 2));

    MaterialWalkthrough._setupListeners(target, walkPoint.onClose);

    MaterialWalkthrough._locateTarget(target, () => {
      MaterialWalkthrough._setProperties(walkPoint.content, walkPoint.color, walkPoint.acceptText);
      dom.setStyle(MaterialWalkthrough._wrapper, {display: 'block'});

      MaterialWalkthrough._renderFrame(target, () => {
        dom.addClass(MaterialWalkthrough._wrapper, 'opened');
        MaterialWalkthrough._renderContent(target, () => {
          dom.removeClass(MaterialWalkthrough._wrapper, 'transiting');
        });

        // Little XGH
        MaterialWalkthrough._renderContent(target, () => {
          dom.removeClass(MaterialWalkthrough._wrapper, 'transiting');
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
    _log('WALK_UPDATE', 'Creating UpdateHandler for #' + target.id);

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
   * Check if is at the end and finish it or move to the next WalkPoint
   */
  static _next(){
    const hasNext = !!MaterialWalkthrough._instance.points && !!MaterialWalkthrough._instance.points[MaterialWalkthrough._instance.currentIndex + 1];
      if (hasNext) {
        MaterialWalkthrough._instance.currentIndex++;
        MaterialWalkthrough._setWalker(
          MaterialWalkthrough._instance.points[MaterialWalkthrough._instance.currentIndex]
        );
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
  static _setupListeners(target, onClose) {
    if (!!MaterialWalkthrough._instance.updateHandler) MaterialWalkthrough._flushListeners();
    MaterialWalkthrough._instance.updateHandler = MaterialWalkthrough._createUpdateHandler(target);

    window.addEventListener('resize', MaterialWalkthrough._instance.updateHandler);
    MaterialWalkthrough._instance.mutationObserver = new MutationObserver(MaterialWalkthrough._instance.updateHandler);
    MaterialWalkthrough._instance.mutationObserver.observe(document.body, {childList: true, subtree: true});

    MaterialWalkthrough._actionButton.addEventListener('click', function actionCallback() {
      if (!!onClose) onClose();

      // Responsive metrics (According the style.css)
      dom.addClass(MaterialWalkthrough._wrapper, 'transiting');

      setTimeout(() => {
        MaterialWalkthrough._next();
      }, MaterialWalkthrough.TRANSITION_DURATION);

      MaterialWalkthrough._actionButton.removeEventListener('click', actionCallback);
    });
  }

  /***
   * Clean the listeners with the actual updateHandler
   */
  static _flushListeners() {
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
  static _setProperties(content, color, acceptText) {
    const borderColor = !!color ? color : MaterialWalkthrough.DEFAULT_COLOR;
    console.log(brightnessByColor(borderColor));

    const brightness = brightnessByColor(borderColor);
    if (
      // BLACK CONTRAST
      (brightness == 127.916 // LIGHT BLUE 500
      || brightness == 122.966 // CYAN 600
      || brightness == 126.36 // TEAL 400
      || brightness == 134.569) // GREEN 500
      // WHITE CONTRAST
      || ((brightness != 145.93 // PINK 300
      || brightness != 139.462 // PURPLE 300
      || brightness != 142.449) // BROWN 300
        && brightness > 138.872) // P&B AVR
    )
      dom.addClass(MaterialWalkthrough._wrapper, 'dark');
    else dom.removeClass(MaterialWalkthrough._wrapper, 'dark');

    dom.setStyle(MaterialWalkthrough._wrapper, { borderColor });
    MaterialWalkthrough._content.innerHTML = content;
    MaterialWalkthrough._actionButton.innerHTML = acceptText || MaterialWalkthrough.DEFAULT_ACCEPT_TEXT;
    if (!MaterialWalkthrough.FORCE_SMALL_BORDER) {
      const themeColor = dom.get('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute('content', borderColor);
    }
  }

  // @TODO: Animate the scroll.
  /***
   * Centralize the scroll to a target.
   * @param {HTMLElement} target
   * @param {function} locateCallback
   */
  static _locateTarget(target, locateCallback) {
    const targetBounding = target.getBoundingClientRect();
    const top = targetBounding.top;
    const maxScrollValue = MaterialWalkthrough.CURRENT_DOCUMENT_HEIGHT - window.innerHeight;

    const YCoordinate = top - (window.innerHeight / 2) + targetBounding.height / 2;
    const secureYCoordinate = YCoordinate > maxScrollValue ? maxScrollValue : YCoordinate;


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
  static _renderFrame(target, renderCallback) {
    // HAVING ISSUES WITH THIS WAY TO GET POSITION IN SOME TESTS
    const targetBounding = target.getBoundingClientRect();
    // Using this line.
    const { height, width, left, top } = targetBounding;

    let holeSize = height > width ? height : width; // Catch the biggest measure
    // Adjust with default min measure if it not higher than it
    if (holeSize < MaterialWalkthrough.MIN_SIZE) holeSize = MaterialWalkthrough.MIN_SIZE;
    _log('WALK_LOCK', 'Walk hole size ' + holeSize + 'px');

    const positions = {
      height: (holeSize + MaterialWalkthrough.GUTTER) + 'px',
      width: (holeSize + MaterialWalkthrough.GUTTER) + 'px',

      marginLeft: -((holeSize + MaterialWalkthrough.GUTTER) / 2) + 'px',
      marginTop: -((holeSize + MaterialWalkthrough.GUTTER) / 2) + 'px',

      left: (left + (width / 2)) + 'px',
      top: (top + (height / 2)) + 'px',
    };
    dom.setStyle(MaterialWalkthrough._wrapper, positions);
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
  static _renderContent(target, renderCallback) {
    const position = MaterialWalkthrough._wrapper.getBoundingClientRect(); // target.getBoundingClientRect(); // target.getClientRects()[0];

    const itCanBeRenderedInRight =
      position.left + (MaterialWalkthrough._wrapper.offsetWidth - MaterialWalkthrough.GUTTER)
      + MaterialWalkthrough._contentWrapper.offsetWidth < window.innerWidth;
    const itCanBeRenderedInLeft = (position.left + MaterialWalkthrough.GUTTER) - MaterialWalkthrough._contentWrapper.offsetWidth > 0;

    const itCanBeRenderedInTop =
      position.top
      - MaterialWalkthrough._contentWrapper.offsetHeight > 0;
    const itCanBeRenderedInBottom =
      position.top
      + MaterialWalkthrough._contentWrapper.offsetHeight + MaterialWalkthrough._wrapper.offsetHeight
      < window.innerHeight;

    _log('WALK_CONTENT', 'itCanBeRenderedInRight: ' + itCanBeRenderedInRight);
    _log('WALK_CONTENT', 'itCanBeRenderedInLeft: ' + itCanBeRenderedInLeft);
    _log('WALK_CONTENT', 'itCanBeRenderedInTop: ' + itCanBeRenderedInTop);
    _log('WALK_CONTENT', 'itCanBeRenderedInBottom: ' + itCanBeRenderedInBottom);

    let left = '100%';
    let top = '100%';
    let marginTop = 0;
    let marginLeft = 0;
    let textAlign = 'left';

    if (!itCanBeRenderedInRight) {
      left = itCanBeRenderedInLeft ? '-' + MaterialWalkthrough._contentWrapper.offsetWidth + 'px'
        : 'calc(50% - 100px)';
      textAlign = itCanBeRenderedInLeft ? 'right' : 'center';
      marginTop = itCanBeRenderedInLeft ? 0 : (itCanBeRenderedInBottom ? '20px' : '-20px');
    }
    if (!itCanBeRenderedInBottom) {
      top = itCanBeRenderedInTop ? '-' + MaterialWalkthrough._contentWrapper.offsetHeight + 'px'
        : MaterialWalkthrough._wrapper.offsetHeight / 2 - MaterialWalkthrough._contentWrapper.offsetHeight / 2 + 'px';
      marginLeft = itCanBeRenderedInTop ? 0 : (!itCanBeRenderedInRight ? '-20px' : '20px');
    }
    dom.setStyle(MaterialWalkthrough._contentWrapper, {left, top, textAlign, marginTop, marginLeft});

    if (renderCallback) renderCallback();
  }

  /***
   * Do a walkthrough to a set of walkpoints.
   * @param {Array<WalkPoint>} walkPoints A list of each walkpoint to move the walktrough.
   * @param {function} callback Callback called when the walkthrough is closed.
   */
  static walk(walkPoints, callback) {
    MaterialWalkthrough._instance.points = walkPoints;
    MaterialWalkthrough._instance.currentIndex = 0;
    MaterialWalkthrough._instance.onCloseCallback = callback;
    if (document.querySelector('meta[name="theme-color"]'))
      MaterialWalkthrough.ORIGINAL_THEME_COLOR = document.querySelector('meta[name="theme-color"]').getAttribute('content');
    else {
      MaterialWalkthrough.ORIGINAL_THEME_COLOR = null;
      var meta = document.createElement('meta');
      meta.name = "theme-color";
      meta.content = "";
      document.querySelector('head').appendChild(meta);
    }
    MaterialWalkthrough.to(walkPoints[0]);
  };

  /***
   * Open the walkthrough to a single walkpoint.
   * @param {WalkPoint} walkPoint The configuration of the walkpoint
   */
  static to(walkPoint) {
    MaterialWalkthrough.CURRENT_DOCUMENT_HEIGHT = document.querySelector('html').offsetHeight;
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

    const themeColor = dom.get('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute('content', MaterialWalkthrough.ORIGINAL_THEME_COLOR);

    // This will centralize the walk while it animate the hole opening with 1000px size.
    dom.setStyle(MaterialWalkthrough._wrapper, { marginTop: '-500px', marginLeft: '-500px' });
    dom.addClass(MaterialWalkthrough._wrapper, 'closed');
    setTimeout(() => {
      dom.setStyle(MaterialWalkthrough._wrapper, {display: 'none'});
      dom.removeClass(MaterialWalkthrough._wrapper, 'opened');
      dom.removeClass(MaterialWalkthrough._wrapper, 'transiting');
      _log('MSG', 'Walker Closed!');
    }, MaterialWalkthrough.TRANSITION_DURATION);
  }
}
