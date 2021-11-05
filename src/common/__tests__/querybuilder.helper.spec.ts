import { IQueryMapper } from '../queryBuilder/queryBuilder.enum';
import {
  convertExactMatch,
  mapperFields
} from '../queryBuilder/queryBuilder.helper';
import { ObjectId } from 'mongodb';

const getMappingData = (): IQueryMapper[] => [
  {
    field: 'name',
    value: 'abcd',
    exactMatch: false
  }
];

describe('queryBuilder.helper', () => {
  describe('convertExactMatch', () => {
    it('should return regex value when exactMatch = false', () => {
      const mappingData = getMappingData();
      const result = convertExactMatch(mappingData[0].value as string, false);
      const expectValue = '/' + mappingData[0].value + '/i';
      expect(result.toString()).toEqual(expectValue);
    });

    it('should return value when exactMatch = true', () => {
      const mappingData = getMappingData();
      const result = convertExactMatch(mappingData[0].value as string, true);
      expect(result).toEqual(mappingData[0].value);
    });
  });

  describe('mapperFields', () => {
    const objectId = new ObjectId();
    const mappingData = [
      {
        field: 'name',
        value: 'abcd',
        exactMatch: false
      },
      {
        field: 'name2',
        value: objectId,
        exactMatch: false
      },
      {
        field: 'name3',
        value: true,
        exactMatch: false
      },
      {
        field: 'name4',
        value: ['a', 'b'],
        exactMatch: false
      },
      {
        field: 'name5',
        value: [true, false],
        exactMatch: false
      },
      {
        field: 'name6',
        value: [objectId],
        exactMatch: false
      }
    ];

    it('should return mapping value when convertMode = true', () => {
      const result = mapperFields(mappingData, true);
      const expectValue = {
        name: /abcd/i,
        name2: objectId,
        name3: true,
        name4: [/a/i, /b/i],
        name5: [true, false],
        name6: [objectId]
      };
      expect(result).toEqual(expectValue);
    });

    it('should return mapping value when convertMode = false', () => {
      const result = mapperFields(mappingData, false);
      const expectValue = {
        name: 'abcd',
        name2: objectId,
        name3: true,
        name4: ['a', 'b'],
        name5: [true, false],
        name6: [objectId]
      };
      expect(result).toEqual(expectValue);
    });
  });
});
