import { IQuery } from './queryBuilder.enum';

export class FieldProperty<T> implements IQuery<T> {
  private property: any;
  constructor(property: T) {
    this.property = property;
  }

  getQuery(): T {
    return this.property;
  }
}
