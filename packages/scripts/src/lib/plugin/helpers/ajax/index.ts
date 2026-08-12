import type { AjaxGET, AjaxPOST } from './ajax.types';
import { createXhrRequest } from './ajax.xhr';

const get: AjaxGET = (url, options = {}) =>
  new Promise((resolve, reject) => {
    const xhr = createXhrRequest('GET', url, resolve, reject, options);
    xhr.send();
  });

const post: AjaxPOST = (url, data, options = {}) =>
  new Promise((resolve, reject) => {
    const xhr = createXhrRequest('POST', url, resolve, reject, options);

    if (data instanceof FormData) {
      xhr.send(data);
      return;
    }

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  });

export const ajax = { get, post };
