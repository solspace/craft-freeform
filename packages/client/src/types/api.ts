import type { GenericValue } from './properties';

export const API_ERROR = 'api_error';

export type ErrorList = {
  [key: string]: GenericValue;
};

type ErrorCollection = {
  [key: string]: ErrorList;
};

export class APIError extends Error {
  errors: ErrorCollection = {};

  constructor(message: string, errors: ErrorCollection) {
    super(message);
    this.name = API_ERROR;
    this.errors = errors;
  }
}
