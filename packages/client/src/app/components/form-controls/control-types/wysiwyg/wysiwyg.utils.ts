// This regex matches any HTML tag, including self-closing tags
const htmlTagRegex = /<[^>]*>/;

export const containsHtmlTags = (value: string): boolean => {
  if (!value) {
    return false;
  }

  return htmlTagRegex.test(value);
};
