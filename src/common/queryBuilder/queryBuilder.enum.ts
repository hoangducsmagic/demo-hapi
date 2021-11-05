import mongoose from 'mongoose';

export enum EnumOperator {
  $and = '$and',
  $or = '$or',
  $in = '$in',
  $eq = '$eq',
  $nin = '$nin',
  $ne = '$ne',
  $gte = '$gte',
  $lte = '$lte',
  $exists = '$exists'
}

export type ILogicalOperatorQuery<T> = {
  [key in keyof typeof EnumOperator]: (T | Partial<ILogicalOperatorQuery<T>>)[];
};

export type IComparisonOperatorQuery<T> = {
  [key in keyof typeof String]: {
    [key in keyof typeof EnumOperator]: (
      | T
      | Partial<IComparisonOperatorQuery<T>>)[];
  };
};

export interface IQuery<T> {
  getQuery():
    | Partial<ILogicalOperatorQuery<T>>
    | Partial<IComparisonOperatorQuery<T>>
    | T;
}

export type QueryMapperValue =
  | string
  | mongoose.Types.ObjectId
  | boolean
  | number;

export interface IQueryMapper {
  field: string;
  value: QueryMapperValue | QueryMapperValue[] | undefined;
  exactMatch: boolean;
}
