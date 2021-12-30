type ClassItem = string | number | boolean | null;

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
