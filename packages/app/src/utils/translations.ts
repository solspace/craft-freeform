declare const Craft: {
  t(category: string, string: string, params: Params): string;
};

interface Params {
  [key: string]: string | number | boolean;
}

export const replace = (string: string, params: Params = {}): string => {
  for (const [key, value] of Object.entries(params)) {
    const pattern = new RegExp('\\{' + key + '\\}', 'g');
    string = string.replace(pattern, value.toString());
  }

  return string;
};

export const translate = (string: string, params: Params = {}): string => {
  if (typeof Craft !== 'undefined') {
    return Craft.t('integrator', string, params);
  }

  return replace(string, params);
};

export default translate;
