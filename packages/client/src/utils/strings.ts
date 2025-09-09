import transliterateFn from '@sindresorhus/transliterate';
import { camelCase } from 'lodash';

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

  return handle;
};
