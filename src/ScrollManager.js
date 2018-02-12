import dom from './DOMUtils';

/**
 * Controls the state of scroll actions.
 * Thanks to @galambalazs.
 */
export default class ScrollManager {

  /**
   * A map object that list, enable/disable each keys that manipulate the scroll into the window.
   * left: 37, up: 38, right: 39, down: 40,
   * spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
   * @type {object}
   */
  static keys = {
    37: 1,
    38: 1,
    39: 1,
    40: 1,
    32: 1,
    33: 1,
    34: 1
  };

  static preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
      e.preventDefault();
    e.returnValue = false;
  }

  static preventDefaultForScrollKeys(e) {
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
  static disable() {
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
  }

  /**
   * Reset the main listeners, enabling the scroll.
   * Also reset the html element styles assigned before in `disable` function.
   */
  static enable() {
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
