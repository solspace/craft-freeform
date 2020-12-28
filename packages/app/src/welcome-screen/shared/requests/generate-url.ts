export const baseUrl = window.location.href.replace(/.*(\/[^/]+\/freeform).*/i, '$1');
export const generateUrl = (url?: string): string => {
  url = (url ?? '')
    .replace(/\/+/g, '/')
    .replace(/^\/(.*)/, '$1')
    .replace(/\/$/, '');

  url = url.length ? `/${url}` : '';

  return `${baseUrl}${url}`;
};

export const appUrl = generateUrl();
