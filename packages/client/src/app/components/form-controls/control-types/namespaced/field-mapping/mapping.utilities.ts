import type { GenericValue } from '@ff-client/types/properties';

export const extractParameter = (
  object: GenericValue,
  parameter: string
): GenericValue => {
  const parameterParts = parameter.split('.');
  let currentObject: GenericValue = object;

  for (const part of parameterParts) {
    if (currentObject === undefined) {
      return undefined;
    }

    currentObject = currentObject[part];
  }

  return currentObject;
};
