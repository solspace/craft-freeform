export const DND_PREFIX = 'freeform-file-dnd';

type ClassAddType = (element: HTMLElement, ...classNames: string[]) => void;

export const addClass: ClassAddType = (element, ...classNames) => {
  element.classList.add(classNames.join('__'));
};

export const removeClass: ClassAddType = (element, ...classNames) => {
  element.classList.remove(classNames.join('__'));
};

export const addDnDClass: ClassAddType = (element, ...classNames) => {
  addClass(element, DND_PREFIX, ...classNames);
};

export const removeDnDClass: ClassAddType = (element, ...classNames) => {
  removeClass(element, DND_PREFIX, ...classNames);
};

export const getClassQuery = (classNames: string | string[]): string => {
  if (typeof classNames === 'string') {
    classNames = classNames.split(' ');
  }

  return classNames.map((className) => `.${className}`).join('');
};
