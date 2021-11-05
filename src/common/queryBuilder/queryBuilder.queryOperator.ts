import { EnumOperator, IQueryMapper } from './queryBuilder.enum';
import { LogicalQuery } from './queryBuilder.logical';
import { ComparisonQuery } from './queryBuilder.comparison';

export class AndOperator<T> extends LogicalQuery<T> {
  constructor() {
    super(EnumOperator.$and);
  }
}

export class OrOperator<T> extends LogicalQuery<T> {
  constructor() {
    super(EnumOperator.$or);
  }
}

export class InOperator<T> extends ComparisonQuery<T> {
  constructor(mapper: IQueryMapper[]) {
    super(EnumOperator.$in, mapper);
  }
}

export class EqOperator<T> extends ComparisonQuery<T> {
  constructor(mapper: IQueryMapper[]) {
    super(EnumOperator.$eq, mapper);
  }
}

export class NinOperator<T> extends ComparisonQuery<T> {
  constructor(mapper: IQueryMapper[]) {
    super(EnumOperator.$nin, mapper);
  }
}

export class NeOperator<T> extends ComparisonQuery<T> {
  constructor(mapper: IQueryMapper[]) {
    super(EnumOperator.$ne, mapper);
  }
}

export class GteOperator<T> extends ComparisonQuery<T> {
  constructor(mapper: IQueryMapper[]) {
    super(EnumOperator.$gte, mapper);
  }
}

export class LteOperator<T> extends ComparisonQuery<T> {
  constructor(mapper: IQueryMapper[]) {
    super(EnumOperator.$lte, mapper);
  }
}

export class ExistsOperator<T> extends ComparisonQuery<T> {
  constructor(mapper: IQueryMapper[]) {
    super(EnumOperator.$exists, mapper);
  }
}
