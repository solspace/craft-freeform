import { fetchCsrf } from "../csrf";
import { HttpError } from "./ajax.classes";
import type { CreateXhrRequest, Headers } from "./ajax.types";

export const createXhrRequest: CreateXhrRequest = async (
  method,
  url,
  resolve,
  reject,
  options,
) => {
  const urlObject = new URL(url, window.location.origin);
  if (options?.queryParams) {
    options.queryParams.forEach((value, key) => {
      urlObject.searchParams.set(key, value);
    });
  }

  const xhr = options.request || new XMLHttpRequest();
  xhr.open(method, urlObject);

  xhr.setRequestHeader("Cache-Control", "no-cache");
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  xhr.setRequestHeader("HTTP_X_REQUESTED_WITH", "XMLHttpRequest");

  const csrf = await fetchCsrf();
  if (csrf) {
    xhr.setRequestHeader("X-CSRF-Token", csrf.value);
  }

  attachHeaders(xhr, options?.headers);

  xhr.onload = () => {
    let data = xhr.response;
    try {
      data = JSON.parse(xhr.response);
    } catch {
      // Do nothing
    }

    const status = xhr.status;
    if (status < 200 || status >= 300) {
      reject(
        new HttpError(
          `Request failed with status ${xhr.statusText}`,
          xhr,
          data,
        ),
      );
      return;
    }

    resolve({
      status: xhr.status,
      data,
      request: xhr,
    });
  };

  xhr.onerror = () => {
    reject(new Error("Network error"));
  };

  xhr.onabort = () => {
    reject(new Error("Request aborted"));
  };

  if (options.onUploadProgress) {
    xhr.upload.onprogress = (event) => {
      options.onUploadProgress(event);
    };
  }

  if (options.cancelToken) {
    options.cancelToken._setCancelFn(() => {
      xhr.abort();
    });
  }

  return xhr;
};

const attachHeaders = (xhr: XMLHttpRequest, headers?: Headers) => {
  if (!headers) {
    return;
  }

  Object.entries(headers).forEach(([key, value]) => {
    xhr.setRequestHeader(key, String(value));
  });
};
