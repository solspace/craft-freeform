import kebabCase from 'lodash/kebabCase';

export const createId = (name?: string): string => {
  return kebabCase(name);
};

export const stripTags = (html: string): string => {
  return html.replace(/<\/?[^>]+(>|$)/g, '');
};
