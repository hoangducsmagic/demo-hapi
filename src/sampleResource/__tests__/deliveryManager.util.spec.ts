import deliveryUtils from '../deliveryManager.util';

describe('delivery util', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    expect.hasAssertions();
  });
  describe('#getFeeByDistance', () => {
    it('Should return 15000 when distance = 0', () => {
      // given
      const distance = 0;

      // when
      const result = deliveryUtils.getFeeByDistance(distance);

      // then
      expect(result).toEqual(15000);
    });

    it('Should return 15000 when distance = 2', () => {
      // given
      const distance = 2;

      // when
      const result = deliveryUtils.getFeeByDistance(distance);

      // then
      expect(result).toEqual(15000);
    });

    it('Should return 20000 when distance = 3', () => {
      // given
      const distance = 3;

      // when
      const result = deliveryUtils.getFeeByDistance(distance);

      // then
      expect(result).toEqual(20000);
    });

    it('Should return 38358.477993367895 when distance = 6.671695598673579', () => {
      // given
      const distance = 6.671695598673579;

      // when
      const result = deliveryUtils.getFeeByDistance(distance);

      // then
      expect(result).toEqual(38358.477993367895);
    });
  });

  describe('#checkProvince', () => {
    it('should return the first province input if matching', () => {
      const provinceName = 'Hà Nội';

      const response = deliveryUtils.checkProvince(provinceName);

      expect(response).toEqual('ha-noi');
    });

    it('should return undefined by province input is not matching any', () => {
      const provinceName = 'Sơn Trà';

      const response = deliveryUtils.checkProvince(provinceName);

      expect(response).toBeUndefined();
    });

    it('should return the first province input if matching multi', async () => {
      const provinceName = 'Hà Nội Hải Phòng';

      const response = deliveryUtils.checkProvince(provinceName);

      expect(response).toEqual('hai-phong');
    });
  });
});
