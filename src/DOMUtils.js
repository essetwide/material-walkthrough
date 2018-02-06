/**
 * Utils used to manipulate DOM.
 */
export default class DOMUtils {

  /**
   * Query for a element in the Document with querySelector. If the target is already a HTMLElement, it bypass.
   * @param {(string|HTMLElement)} target THe query in CSS selector syntax to match a Element from Document. Or it can be an element already, that will bypass.
   * @returns {HTMLElement}
   */
  static get(target) {
    if (typeof target === 'string') return document.querySelector(target);
    return target;
  }

  /**
   * Set a new style to an HTMLElement.
   * @param {HTMLElement} element The target element to apply the style.
   * @param properties
   */
  static setStyle(element, properties) {
    Object.keys(properties).forEach(function (val) {
      element.style[val] = properties[val];
    });
  }

  /**
   * Append a new element to an target using HTMLString.
   * @param {HTMLElement} element The target element.
   * @param {HTMLString|string} content A valid string based on HTMLString to append into the element.
   */
  static appendTo(element, content) {
    const tmpElt = document.createElement('div');
    tmpElt.innerHTML = content;
    element.appendChild(tmpElt.children[0]);
  }

  /**
   * Remove a specific class from classList of a target element.
   * @param {HTMLElement} element The target element.
   * @param {string} className The class to remove.
   */
  static removeClass(element, className) {
    element.classList.remove(className);
  }

  /**
   * Add a specific class from classList of a target element.
   * @param {HTMLElement} element The target element.
   * @param {string} className The class to add.
   */
  static addClass(element, className) {
    element.classList.add(className);
  }
}
