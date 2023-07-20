import camelCase from 'lodash.camelcase';

import type { MiddlewareImplementation } from '../middleware';

type Args = {
  target: string;
  camelize?: boolean;
};

const injectInto: MiddlewareImplementation<string, Args> = (
  value,
  { target, camelize = false },
  _,
  updateCallback
) => {
  let targetValue = value;

  if (camelize) {
    targetValue = camelCase(targetValue);
  }

  updateCallback && updateCallback(target, targetValue);

  return value;
};

export default injectInto;
