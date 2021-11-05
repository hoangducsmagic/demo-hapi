import { reduce } from 'lodash';
import {
  EnumOperator,
  ILogicalOperatorQuery,
  IQuery,
  IQueryMapper
} from './queryBuilder.enum';
import { FieldProperty } from './queryBuilder.fieldProperty';
import { mapperFields } from './queryBuilder.helper';

export abstract class LogicalQuery<T> implements IQuery<T> {
  private arrPropertyQuery: IQuery<T>[] = [];
  protected keyQuery: EnumOperator;
  constructor(keyQuery: EnumOperator) {
    this.keyQuery = keyQuery;
  }

  getQuery(): Partial<ILogicalOperatorQuery<T>> {
    const arrQuery = this.arrPropertyQuery.map(value => {
      return value.getQuery();
    });
    if (!arrQuery || arrQuery.length == 0) return {};
    return {
      [this.keyQuery]: arrQuery
    };
  }

  addOperator(query: IQuery<T>): LogicalQuery<T> {
    this.arrPropertyQuery.push(query);
    return this;
  }

  addOperators(queries: IQuery<T>[]): LogicalQuery<T> {
    this.arrPropertyQuery.push(...queries);
    return this;
  }

  addFieldsWithMapper<T extends object>(input: IQueryMapper[]): any {
    const querry = mapperFields(input) as T;
    this.addFields(querry);
    return this;
  }

  addFields<T extends object>(input: any): any {
    const arrQuery = reduce(
      input,
      (acc: (IQuery<T>)[], value: T[keyof T] | IQuery<T>, key: string) => {
        if (value || typeof value === 'boolean' || typeof value === 'number') {
          if (value instanceof FieldProperty || value instanceof LogicalQuery) {
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
