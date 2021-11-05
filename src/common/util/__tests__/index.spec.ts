import Util from '../';
describe('Is Async function', () => {
  it('should return true if function is async', () => {
    // given
    const fun = async () => Promise.resolve('data');

    // when
    const result = Util.isAsync(fun);

    // then
    expect(result).toBeTruthy();
  });
  it('should return false when function is not async', () => {
    // given
    const fun = () => 'data';

    // when
    const result = Util.isAsync(fun);

    // then
    expect(result).toBeFalsy();
  });

  it('Should generate mongo uris with single host', () => {
    // given
    const dbName = 'common_db';
    const hosts = ['test-mongo-0.com:27017'];
    const username = 'user';
    const password = 'password';

    // when
    const dbUri = Util.getMongoUri(username, password, dbName, hosts);

    // then
    expect(dbUri).toEqual(
      `mongodb://${username}:${password}@${hosts[0]}/${dbName}`
    );
  });

  it('Should generate mongo uris with more than one hosts', () => {
    // given
    const dbName = 'common_db';
    const hosts = ['test-mongo-0.com:27017', 'test-mongo-1.com:27017'];
    const username = 'user';
    const password = 'password';

    // when
    const dbUri = Util.getMongoUri(username, password, dbName, hosts);

    // then
    expect(dbUri).toEqual(
      `mongodb://${username}:${password}@${hosts[0]},${hosts[1]}/${dbName}`
    );
  });

  it('Should return 0 when position1(10.8231,106.6297) and position2(10.8231,106.6297) are the same', () => {
    // given
    const position1 = {
      lat: 10.8231,
      lng: 106.6297
    };
    const position2 = {
      lat: 10.8231,
      lng: 106.6297
    };

    // when
    const result = Util.getDistance(position1, position2);

    // then
    expect(result).toEqual(0);
  });

  it('Should return 6.671695598673579 when position1(10.8231,106.6297) and position2(10.8831,106.6297)', () => {
    // given
    const position1 = {
      lat: 10.8231,
      lng: 106.6297
    };
    const position2 = {
      lat: 10.8831,
      lng: 106.6297
    };

    // when
    const result = Util.getDistance(position1, position2);

    // then
    expect(result).toEqual(6.671695598673579);
  });
});
