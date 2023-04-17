import type { Form } from '@ff-client/types/forms';
import type { GenericValue } from '@ff-client/types/properties';

export type FormErrors = {
  [key: string]: {
    [key: string]: string[];
  };
};

export type FormState = Form & {
  errors: FormErrors;
};

export type UpdateProps = Partial<Omit<FormState, 'properties'>>;

export type ModifyProps = {
  key: string;
  namespace: string;
  value: GenericValue;
};

export type ErrorProps = {
  key: string;
  errors: string[];
};
