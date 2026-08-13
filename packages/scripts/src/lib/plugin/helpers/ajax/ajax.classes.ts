export class CancelToken {
  private cancelFn: (() => void) | null = null;

  cancel(): void {
    if (this.cancelFn) {
      this.cancelFn();
      this.cancelFn = null;
    }
  }

  _setCancelFn(fn: () => void): void {
    this.cancelFn = fn;
  }
}

type ErrorResponse<T> = {
  data: T;
  request: XMLHttpRequest;
};

export class HttpError<T> extends Error {
  response: ErrorResponse<T>;
  status: number;

  constructor(message: string, request: XMLHttpRequest, data: T) {
    super(message);
    this.name = 'HttpError';
    this.response = { data, request };
    this.status = request.status;

    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export class RequestAbortedError extends Error {
  constructor() {
    super('Request aborted');
    this.name = 'RequestAbortedError';

    Object.setPrototypeOf(this, RequestAbortedError.prototype);
  }
}
