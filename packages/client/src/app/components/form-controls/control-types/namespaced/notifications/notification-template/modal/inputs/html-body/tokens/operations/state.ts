let dropdown: HTMLElement;
let currentFilter = '';

export const setDropdown = (element: HTMLElement): void => {
  dropdown = element;
};

export const getDropdown = (): HTMLElement | undefined => dropdown;

export const setFilter = (filter: string): void => {
  currentFilter = filter;
};

export const getFilter = (): string => currentFilter;
