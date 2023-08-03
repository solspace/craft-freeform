import type { RootState } from '../..';

import type { ModalErrors } from './modal.types';

export const modalSelectors = {
  values: (state: RootState) => state.modal.values,
  errors: (state: RootState): ModalErrors => state.modal.errors,
} as const;
