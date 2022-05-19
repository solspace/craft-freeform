import parse from 'url-parse';

export const baseUrl = window.location.href.replace(/(.*\/freeform).*/i, '$1');
export const generateUrl = (url?: string, absolute = true): string => {
  url = (url ?? '')
    .replace(/\/+/g, '/')
    .replace(/^\/(.*)/, '$1')
    .replace(/\/$/, '');

  url = url.length ? `/${url}` : '';

  const parsedUrl = parse(`${baseUrl}${url}`);

  return absolute ? parsedUrl.href : parsedUrl.pathname;
};
