import type { MiddlewareImplementation } from '../middleware';

const middleware: MiddlewareImplementation<
  string,
  {
    pattern: string;
    replacement?: string;
    modifier?: string;
  }
> = (value, { pattern, replacement = '', modifier = 'g' }) => {
  const regex = new RegExp(pattern, modifier);

  return value.replace(regex, replacement);
};

export default middleware;
