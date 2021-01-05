/**
 * @returns {boolean}
 * @private
 */
export const isSafari = () => {
  return navigator.userAgent.indexOf('Safari') > -1;
};

/**
 * @returns {number|boolean}
 * @private
 */
export const isIe = () => {
  const userAgent = window.navigator.userAgent;

  const msie = userAgent.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(userAgent.substring(msie + 5, userAgent.indexOf('.', msie)), 10);
  }

  const trident = userAgent.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    const versionNumber = userAgent.indexOf('rv:');
    return parseInt(userAgent.substring(versionNumber + 3, userAgent.indexOf('.', versionNumber)), 10);
  }

  const edge = userAgent.indexOf('Edge/');
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(userAgent.substring(edge + 5, userAgent.indexOf('.', edge)), 10);
  }

  // other browser
  return false;
};
