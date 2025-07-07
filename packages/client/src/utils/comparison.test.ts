import { createSemverCompare, objectHasAnyKey } from './comparison';

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

  describe('createSemverCompare', () => {
    it('should create a comparison function for the given version', () => {
      const compare = createSemverCompare('1.0.0');
      expect(compare('1.0.0')).toBe(true);
      expect(compare('1.0.1')).toBe(false);
      expect(compare('0.9.9')).toBe(false);
    });

    it('should create sub-functions', () => {
      const compare = createSemverCompare('1.0.0');
      expect(compare.atLeast('1.0.0')).toBe(true);
      expect(compare.atMost('1.0.0')).toBe(true);

      expect(compare.below('1.0.0')).toBe(false);
      expect(compare.above('1.0.0')).toBe(false);

      expect(compare.atLeast('1.0.1')).toBe(false);
      expect(compare.atMost('1.0.1')).toBe(true);
      expect(compare.below('1.0.1')).toBe(true);
      expect(compare.above('1.0.1')).toBe(false);
    });
  });
});
