import type { AxiosError } from 'axios';

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
  status: number;

  //constructor(message: string, errors: ErrorCollection) {
  constructor(error: AxiosError<{ errors: ErrorCollection }>) {
    super(error.message);
    this.name = API_ERROR;
    this.status = error.response.status;
    this.errors = error.response.data.errors;
  }
}
