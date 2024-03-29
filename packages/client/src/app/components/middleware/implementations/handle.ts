import { transliterate } from 'transliteration';

import type { MiddlewareImplementation } from '../middleware';

const middleware: MiddlewareImplementation<string> = (value) => {
  value = transliterate(value);

  return value.replace(/[^a-zA-Z0-9\-_]/g, '');
};

export default middleware;
