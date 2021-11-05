import { ERROR_CODE } from './errors';
import http from './http';

export class HttpResponse<T> extends http.ResponseBase<T, ERROR_CODE> {
  constructor() {
    super();
  }
}
