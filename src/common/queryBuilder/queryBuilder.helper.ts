import { replace } from 'lodash';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { IQueryMapper, QueryMapperValue } from './queryBuilder.enum';

const convertExactMatch = (
  value: string,
  exactMatch: boolean
): string | RegExp => {
  return exactMatch
    ? value
    : new RegExp(
        replace(
          value,
          /([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,
          '\\$&'
        ),
        'i'
      );
};

const mapperFields = (
  queryMapper: IQueryMapper[],
  convertMode: boolean = true
): any => {
  return queryMapper.reduce(
    (
      filterFields: {
        [index: string]:
          | (QueryMapperValue | RegExp)
          | (QueryMapperValue | RegExp)[];
      },
      item
    ) => {
      const { field, value, exactMatch } = item;
      if (typeof value === 'boolean') {
        filterFields[field] = value;
        return filterFields;
      }
      if (typeof value === 'number') {
        filterFields[field] = value;
        return filterFields;
      }

      if (!value) return filterFields;

      if (value instanceof Array) {
        const newValues = value.map((queryValue: QueryMapperValue) => {
          if (typeof queryValue === 'boolean') {
            return queryValue;
          } else if (queryValue instanceof ObjectId) {
            return new mongoose.Types.ObjectId(queryValue);
          } else if (typeof queryValue === 'string') {
            return convertMode
              ? convertExactMatch(queryValue, exactMatch)
              : queryValue;
          }
          return queryValue;
        });
        filterFields[field] = newValues;
        return filterFields;
      }

      if (value instanceof ObjectId) {
        filterFields[field] = new mongoose.Types.ObjectId(value);
        return filterFields;
      }

      filterFields[field] = convertMode
        ? convertExactMatch(value, exactMatch)
        : value;

      return filterFields;
    },
    {}
  );
};

export { convertExactMatch, mapperFields };
