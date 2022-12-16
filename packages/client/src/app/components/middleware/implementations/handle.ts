import camelCase from 'lodash.camelcase';

import type { MiddlewareImplementation } from '../middleware';

const middleware: MiddlewareImplementation<string, [boolean] | undefined> = (
  value,
  [autoCamelize] = [false]
) => {
  if (autoCamelize) {
    value = camelCase(value);
  }

  return value.replace(/[^a-zA-Z0-9\-_]/g, '');
};

export default middleware;
