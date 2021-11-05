import {
  AndOperator,
  NeOperator,
  OrOperator,
  QueryBuilder
} from '../queryBuilder';
import { IQueryMapper } from '../queryBuilder/queryBuilder.enum';
import { convertExactMatch } from '../queryBuilder/queryBuilder.helper';

const getMappingData = (): IQueryMapper[] => [
  {
    field: 'name',
    value: 'abcd',
    exactMatch: true
  }
];

describe('queryBuilder', () => {
  it('addFieldsWithMapper (LogicalQuery)', () => {
    const mappingData = getMappingData();
    const value = convertExactMatch(
      mappingData[0].value as any,
      mappingData[0].exactMatch
    );
    const expectedQuery = { $and: [{ [mappingData[0].field]: value }] };
    const query = new QueryBuilder(new AndOperator())
      .addFieldsWithMapper(mappingData)
      .build();
    expect(query).toEqual(expectedQuery);
  });

  it('addOperator (LogicalQuery)', () => {
    const mappingDataOr = getMappingData();
    const valueOr = convertExactMatch(
      mappingDataOr[0].value as any,
      mappingDataOr[0].exactMatch
    );
    const expectedQuery = {
      $and: [{ $or: [{ [mappingDataOr[0].field]: valueOr }] }]
    };
    const orQuery = new OrOperator().addFieldsWithMapper(mappingDataOr);
    const query = new QueryBuilder(new AndOperator())
      .addOperator(orQuery)
      .build();
    expect(query).toEqual(expectedQuery);
  });

  it('addOperators (ComparisonQuery + LogicalQuery)', () => {
    const mappingDataOr = getMappingData();
    const mappingDataNe = getMappingData();
    const valueOr = convertExactMatch(
      mappingDataOr[0].value as any,
      mappingDataOr[0].exactMatch
    );
    const expectedQuery = {
      $and: [
        { $or: [{ [mappingDataOr[0].field]: valueOr }] },
        { [mappingDataNe[0].field]: { $ne: mappingDataNe[0].value } }
      ]
    };
    const orQuery = new OrOperator().addFieldsWithMapper(mappingDataOr);
    const inQuery = new NeOperator(mappingDataNe);
    const query = new QueryBuilder(new AndOperator())
      .addOperators([orQuery, inQuery])
      .build();
    expect(query).toEqual(expectedQuery);
  });
});
