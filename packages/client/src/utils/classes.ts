type ClassItem = string | number | boolean | null;

export const elementTreeHasClass = (
  element: Element | null,
  classNames: string[] | string
): boolean => {
  if (typeof classNames === 'string') {
    classNames = classNames.split(' ');
  }

  if (!element || !element.classList) {
    return false;
  }

  while (element) {
    for (const className of classNames) {
      if (element.classList.contains(className)) {
        return true;
      }
    }

    element = element.parentElement;
  }

  return false;
};

export const classes = (...args: ClassItem[]): string =>
  args
    .map((item) => {
      if (typeof item === 'string') {
        item = item.trim();
      }

      return item;
    })
    .filter((item) => !!item)
    .join(' ');

export default classes;
