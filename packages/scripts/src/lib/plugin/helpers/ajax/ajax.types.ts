import type { CancelToken } from './ajax.classes';

export type Headers = Record<string, string | boolean | number>;

export type Options = {
  headers?: Headers;
  request?: XMLHttpRequest;
  cancelToken?: CancelToken;
  onUploadProgress?: (progress: ProgressEvent) => void;
};

export type ExtendedOptions = Options & {
  method?: string;
  data?: Document | XMLHttpRequestBodyInit | null;
};

export type ResponseObject<D> = {
  status: number;
  data: D;
  request: XMLHttpRequest;
};

export type AjaxGET = <R>(url: URL | string, options?: Options) => Promise<ResponseObject<R>>;
export type AjaxPOST = <R, D = unknown>(url: URL | string, data: D, options?: Options) => Promise<ResponseObject<R>>;

export type CreateXhrRequest = <T>(
  method: string,
  url: string | URL,
  resolve: (value: ResponseObject<T>) => void,
  reject: (reason?: unknown) => void,
  options?: Options
) => Promise<XMLHttpRequest>;
