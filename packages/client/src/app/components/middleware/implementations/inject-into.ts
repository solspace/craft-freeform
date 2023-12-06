import camelCase from 'lodash.camelcase';

import type { MiddlewareImplementation } from '../middleware';

type Args = {
  target: string;
  camelize?: boolean;
  onlyNew?: boolean;
};

const injectInto: MiddlewareImplementation<string, Args> = (
  value,
  { target, camelize = false, onlyNew = false },
  context,
  updateCallback
) => {
  if (onlyNew && context?.id !== undefined) {
    return value;
  }

  let targetValue = value;

  if (camelize) {
    targetValue = camelCase(targetValue);
  }

  updateCallback && updateCallback(target, targetValue);

  return value;
};

export default injectInto;
