import { ComparisonQuery } from './queryBuilder.comparison';
import { IQuery } from './queryBuilder.enum';
import { LogicalQuery } from './queryBuilder.logical';

export class QueryBuilder<T> {
  private operatorInit: LogicalQuery<T> | ComparisonQuery<T>;

  constructor(operator: ComparisonQuery<T> | LogicalQuery<T>) {
    this.operatorInit = operator;
  }

  addOperator(operatorQuery: IQuery<T>) {
    (this.operatorInit as LogicalQuery<T>).addOperator(operatorQuery);
    return this;
  }

  addOperators(operatorsQuery: IQuery<T>[]) {
    (this.operatorInit as LogicalQuery<T>).addOperators(operatorsQuery);
    return this;
  }

  addFieldsWithMapper(query: any) {
    (this.operatorInit as LogicalQuery<T>).addFieldsWithMapper(query);
    return this;
  }

  addFields(query: any) {
    (this.operatorInit as LogicalQuery<T>).addFields(query);
    return this;
  }

  build() {
    return this.operatorInit.getQuery();
  }
}
