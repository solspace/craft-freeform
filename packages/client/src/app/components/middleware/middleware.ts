import type { RootState } from '@editor/store';
import type { GenericValue, Middleware } from '@ff-client/types/properties';

import * as Middlewares from './implementations';

export type Context = Record<string, GenericValue>;
export type MiddlewareImplementation<T, A = undefined> = (
  value: T,
  args: A,
  getState: () => RootState
) => T;

const middlewareStack: Record<
  string,
  MiddlewareImplementation<unknown, unknown>
> = Middlewares;

export const applyMiddleware = <T>(
  value: T,
  middlewareList: Middleware[],
  getState: () => RootState
): T => {
  let updatedValue: T = value;
  middlewareList.forEach((middleware) => {
    const [name, args] = middleware;
    if (middlewareStack[name]) {
      updatedValue = middlewareStack[name](value, args, getState) as T;
    }
  });

  return updatedValue;
};
