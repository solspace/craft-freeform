import transliterateFn from '@sindresorhus/transliterate';
import camelCase from 'lodash/camelCase';

type HandleOptions = {
  transliterate?: boolean;
  camelize?: boolean;
};

export const generateHandle = (
  value: string,
  options: HandleOptions = {}
): string => {
  const { transliterate, camelize } = options;

  let handle = value;

  if (transliterate) {
    handle = transliterateFn(handle);
  }

  if (camelize) {
    handle = camelCase(handle);
  }

  handle = handle.replace(/^[^a-z]+/gi, '');

  return handle;
};
