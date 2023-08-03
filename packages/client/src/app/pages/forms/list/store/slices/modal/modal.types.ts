import type { GenericValue } from '@ff-client/types/properties';

export type ModalErrors = {
  [key: string]: {
    [key: string]: string[];
  };
};

export type ModalState = {
  values: Record<string, GenericValue>;
  initialValues: Record<string, GenericValue>;
  errors: ModalErrors;
};

export type UpdateValue = {
  key: string;
  value: GenericValue;
};
