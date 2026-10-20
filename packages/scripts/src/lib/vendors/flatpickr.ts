type FlatpickrGlobal = {
  flatpickr?: unknown;
};

type FlatpickrElement = {
  _flatpickr?: unknown;
};

export type FlatpickrInstance = {
  calendarContainer?: HTMLElement;
  config?: { onOpen?: (() => void)[] };
  set: (option: string, value: unknown) => void;
};

export type Flatpickr = (
  element: Element,
  options?: unknown,
) => FlatpickrInstance;

export const getFlatpickr = (): Flatpickr | null => {
  const flatpickr = (window as unknown as FlatpickrGlobal).flatpickr;

  return typeof flatpickr === "function" ? (flatpickr as Flatpickr) : null;
};

export const hasFlatpickr = (): boolean => getFlatpickr() !== null;

export const hasFlatpickrInstance = (element: Element): boolean =>
  Boolean((element as unknown as FlatpickrElement)._flatpickr);
