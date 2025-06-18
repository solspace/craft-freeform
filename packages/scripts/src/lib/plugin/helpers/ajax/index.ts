import { createXhrRequest } from './ajax.hxr';
import type { AjaxGET, AjaxPOST, ExtendedOptions, ResponseObject } from './ajax.types';

const get: AjaxGET = async (url, options = {}) =>
  new Promise((resolve, reject) => {
    createXhrRequest('GET', url, resolve, reject, options).then((xhr) => {
      xhr.open('GET', url);
      xhr.send();
    });
  });

const post: AjaxPOST = async (url, data, options = {}) =>
  new Promise((resolve, reject) => {
    createXhrRequest('POST', url, resolve, reject, options).then((xhr) => {
      if (data instanceof FormData) {
        xhr.send(data);
      } else {
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
      }
    });
  });

export const ajax = <R>(url: URL | string, options?: ExtendedOptions): Promise<ResponseObject<R>> =>
  new Promise((resolve, reject) => {
    createXhrRequest(options?.method || 'GET', url, resolve, reject, options).then((xhr) => {
      const data = options?.data;
      if (data instanceof FormData) {
        xhr.send(data);
      } else {
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
      }
    });
  });

ajax.get = get;
ajax.post = post;
