import { HttpError, RequestAbortedError } from './ajax.classes';
import type { Headers, Options, ResponseObject } from './ajax.types';

export const createXhrRequest = <T>(
  method: string,
  url: URL | string,
  resolve: (value: ResponseObject<T>) => void,
  reject: (reason?: unknown) => void,
  options: Options = {}
): XMLHttpRequest => {
  const urlObject = new URL(url.toString(), window.location.origin);
  options.queryParams?.forEach((value, key) => {
    urlObject.searchParams.set(key, value);
  });

  const xhr = options.request || new XMLHttpRequest();
  xhr.open(method, urlObject.toString());
  xhr.setRequestHeader('Cache-Control', 'no-cache');
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('HTTP_X_REQUESTED_WITH', 'XMLHttpRequest');
  attachHeaders(xhr, options.headers);

  xhr.onload = () => {
    let data = xhr.response;

    try {
      data = JSON.parse(xhr.responseText);
    } catch {
      // Keep the original response when it is not JSON.
    }

    if (xhr.status < 200 || xhr.status >= 300) {
      reject(new HttpError(`Request failed with status ${xhr.statusText}`, xhr, data));
      return;
    }

    resolve({
      status: xhr.status,
      data,
      request: xhr,
    });
  };

  xhr.onerror = () => {
    reject(new Error('Network error'));
  };

  xhr.onabort = () => {
    reject(new RequestAbortedError());
  };

  if (options.onUploadProgress) {
    xhr.upload.onprogress = options.onUploadProgress;
  }

  options.cancelToken?._setCancelFn(() => {
    xhr.abort();
  });

  return xhr;
};

const attachHeaders = (xhr: XMLHttpRequest, headers?: Headers): void => {
  if (!headers) {
    return;
  }

  Object.entries(headers).forEach(([key, value]) => {
    xhr.setRequestHeader(key, String(value));
  });
};
