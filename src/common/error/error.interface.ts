import { StatusCode } from '../http/htttp.enums';

export interface IErrorDetail {
  message: string;
  key: string;
  code: string;
}

export interface IError<ErrorEnumType> {
  code: ErrorEnumType | number;
  message: string;
  errors?: IErrorDetail[];
}

export interface IErrorListDetail {
  message: string;
  statusCode: StatusCode;
}

export interface IErrorList {
  [key: string]: IErrorListDetail;
}
