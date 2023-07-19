import type { GenericValue, Middleware } from '@ff-client/types/properties';

import * as Middlewares from './implementations';

export type MiddlewareInjectCallback = (
  key: string,
  value: GenericValue
) => void;

export type Context = Record<string, GenericValue>;
export type MiddlewareImplementation<T, A = undefined> = (
  value: T,
  args?: A,
  context?: GenericValue,
  injectCallback?: MiddlewareInjectCallback
) => T;

const middlewareStack: Record<
  string,
  MiddlewareImplementation<unknown, unknown>
> = Middlewares;

export const applyMiddleware = <T>(
  value: T,
  middlewareList: Middleware[],
  context?: GenericValue,
  injectCallback?: MiddlewareInjectCallback
): T => {
  let updatedValue: T = value;
  middlewareList.forEach((middleware) => {
    const [name, args] = middleware;
    if (middlewareStack[name]) {
      updatedValue = middlewareStack[name](
        value,
        args,
        context,
        injectCallback
      ) as T;
    }
  });

  return updatedValue;
};
