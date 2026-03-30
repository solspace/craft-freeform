export class CancelToken {
  private cancelFn: () => void;

  cancel() {
    if (this.cancelFn) {
      this.cancelFn();
      this.cancelFn = null;
    }
  }

  _setCancelFn(fn: () => void) {
    this.cancelFn = fn;
  }
}

export class HttpError<T> extends Error {
  response: XMLHttpRequest & { data: T };
  status: number;

  constructor(message: string, response: XMLHttpRequest, data: T) {
    super(message);
    this.response = { ...response, data };
    this.status = response.status;

    // Set the prototype explicitly to maintain the prototype chain
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
