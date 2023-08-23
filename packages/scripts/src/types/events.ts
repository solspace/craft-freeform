import type Freeform from '@components/front-end/plugin/freeform';

export type FreeformEvent = CustomEvent & {
  freeform: Freeform;
  form: HTMLFormElement;
};
