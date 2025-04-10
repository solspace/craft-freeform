import transliterateFn from '@sindresorhus/transliterate';
import { camelCase } from 'lodash';

import type { MiddlewareImplementation } from '../middleware';

type Args = {
  target: string;
  camelize?: boolean;
  transliterate?: boolean;
  bypassConditions?: Array<{
    name: string;
    isTrue: boolean;
  }>;
};

const injectInto: MiddlewareImplementation<string, Args> = (
  value,
  { target, camelize = false, transliterate = false, bypassConditions },
  context,
  updateCallback
) => {
  if (bypassConditions !== undefined) {
    for (const condition of bypassConditions) {
      if (Boolean(context?.[condition.name]) === condition.isTrue) {
        return value;
      }
    }
  }

  let targetValue = value;

  if (transliterate) {
    targetValue = transliterateFn(targetValue);
  }

  if (camelize) {
    targetValue = camelCase(targetValue);
  }

  updateCallback?.(target, targetValue);

  return value;
};

export default injectInto;
