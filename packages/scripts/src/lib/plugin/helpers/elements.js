export const getClassArray = (classList) => {
  if (typeof classList === 'string') {
    classList = classList.split(' ');
  }

  return classList;
};

/**
 * Adds class names to element
 *
 * @param {Element} elem
 * @param {string | Array} classList
 * @private
 */
export const addClass = (elem, classList) => {
  getClassArray(classList).map((className) => elem.classList.add(className));
};

/**
 * Removes class names from element
 *
 * @param {Element} elem
 * @param {string | array} classList
 * @private
 */
export const removeClass = (elem, classList) => {
  getClassArray(classList).map((className) => elem.classList.remove(className));
};
