import { objectHasAnyKey } from './comparison';

describe('comparisons', () => {
  describe('objectHasAnyKey', () => {
    it('should return true if the object has any of the specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(objectHasAnyKey(obj, ['a', 'd'])).toBe(true);
    });

    it('should return false if the object does not have any of the specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(objectHasAnyKey(obj, ['d', 'e'])).toBe(false);
    });
  });
});
