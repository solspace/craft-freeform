import Hashids from 'hashids';
import { camelize } from 'underscore.string';

const minHashLength = 9;
const hashids = new Hashids('composer', minHashLength);

/**
 * Get a hash from the current time
 *
 * @returns {*}
 */
export function hashFromTime() {
  const time = new Date().getTime();

  return hashids.encode(time);
}

/**
 * Hash an ID
 *
 * @param id
 * @returns {*}
 */
export function hashId(id) {
  return hashids.encode(id);
}

/**
 * Get the int value of a hashed ID
 *
 * @param hash
 * @returns {*}
 */
export function deHashId(hash) {
  if (!hash) {
    return null;
  }

  return hashids.decode(hash).pop();
}

/**
 * Strips out all invalid characters from the handle string
 *
 * @param value
 * @param autoCamelize
 * @returns {*}
 */
export function getHandleValue(value, autoCamelize = true) {
  let handleValue = value;

  if (autoCamelize) {
    handleValue = camelize(value, true);
  }

  handleValue = handleValue.replace(/[^a-zA-Z0-9\-_]/g, '');

  return handleValue;
}

/**
 * Creates a [{key: ..., value: ...}, ...] array from the given params
 *
 * @param data
 * @param keyProperty
 * @param valueProperty
 * @returns {Array}
 */
export const createSelectOptionData = (data, keyProperty, valueProperty) => {
  const options = [];

  data.forEach((item) => {
    options.push({
      key: item[keyProperty],
      value: item[valueProperty],
    });
  });

  return options;
};
