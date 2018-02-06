import dom from './DOMUtils';

// Thanks to @galambalazs
/**
 * Controls the state of scroll actions.
 */
export default class ScrollManager {
  // left: 37, up: 38, right: 39, down: 40,
  // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
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
