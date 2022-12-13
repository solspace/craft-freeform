import type { AppDispatch } from '@editor/store';
import type { Property } from '@ff-client/types/properties';

export type FormControlType<T, P extends Property = Property> = {
  namespace: string;
  value: T;
  property: P;
  dispatch: AppDispatch;
};
