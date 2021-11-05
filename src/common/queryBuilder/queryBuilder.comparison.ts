import { IQuery } from '.';
import {
  EnumOperator,
  IComparisonOperatorQuery,
  IQueryMapper
} from './queryBuilder.enum';
import { mapperFields } from './queryBuilder.helper';
import { FieldProperty } from './queryBuilder.fieldProperty';
import { reduce } from 'lodash';

export abstract class ComparisonQuery<T> implements IQuery<T> {
  private arrPropertyQuery: IQuery<T>[] = [];
  private keyQuery: string;
  constructor(keyQuery: EnumOperator, mapper: IQueryMapper[]) {
    this.keyQuery = keyQuery;
    this.mapField(mapper);
  }

  getQuery(): Partial<IComparisonOperatorQuery<T>> | any {
    const arrQuery = this.arrPropertyQuery.map(value => {
      return value.getQuery();
    });
    if (!arrQuery || arrQuery.length == 0) return {};
    const queryResult = arrQuery.reduce((result: any, item: any) => {
      var key = Object.keys(item)[0];
      result[key] = { [this.keyQuery]: item[key] };
      return result;
    }, {});
    return queryResult;
  }

  mapField<T extends object>(mapper: IQueryMapper[]): any {
    const query = mapperFields(mapper) as T;
    const arrQuery = reduce(
      query,
      (acc: (IQuery<T>)[], value: T[keyof T] | IQuery<T>, key: string) => {
        if (value || typeof value === 'boolean' || typeof value === 'number') {
          if (
            value instanceof FieldProperty ||
            value instanceof ComparisonQuery
          ) {
            acc.push(value);
            return acc;
          }
          acc.push(new FieldProperty<any>({ [key]: value }));
        }
        return acc;
      },
      []
    );
    this.arrPropertyQuery.push(...arrQuery);
    return this;
  }
}
