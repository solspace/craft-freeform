import { describe, expect, it } from '@jest/globals';

import { parseNumericValue } from './numbers';

describe('numbers', () => {
  describe('parseNumericValue', () => {
    it('converts empty to undefined', () => {
      expect(parseNumericValue('')).toBeUndefined();
    });

    it('converts numeric value to number', () => {
      expect(parseNumericValue('125')).toBe(125);
    });

    it('converts unsigned to absolute version', () => {
      expect(parseNumericValue('-125', { unsigned: true })).toBe(125);
      expect(parseNumericValue('-125.44', { unsigned: true })).toBe(125.44);
    });

    it('defaults to min if input below specified minimum', () => {
      expect(parseNumericValue('15', { min: 30 })).toBe(30);
      expect(parseNumericValue('-15', { min: 0 })).toBe(0);
      expect(parseNumericValue('15', { min: 0 })).toBe(15);
    });

    it('defaults to max if input above specified maximum', () => {
      expect(parseNumericValue('15', { max: 10 })).toBe(10);
      expect(parseNumericValue('5', { max: 0 })).toBe(0);
      expect(parseNumericValue('15', { max: 30 })).toBe(15);
    });

    it('removes non-numeric characters from a number string and parses as number', () => {
      expect(parseNumericValue('1,000')).toBe(1000);
      expect(parseNumericValue('1,000.00')).toBe(1000);
      expect(parseNumericValue('abc 300.21_ch', { unsigned: true })).toBe(
        300.21
      );
    });

    it('defaults to undefined if messed up value specified', () => {
      expect(parseNumericValue('abc')).toBeUndefined();
      expect(parseNumericValue('313.321.22')).toBeUndefined();
    });

    it('converts zero to 0', () => {
      expect(parseNumericValue('0')).toBe(0);
      expect(parseNumericValue('0.00')).toBe(0);
      expect(parseNumericValue('abc 0')).toBe(0);
    });

    it('uses unsigned before max', () => {
      expect(parseNumericValue('-9', { unsigned: true, min: 0, max: 10 })).toBe(
        9
      );

      expect(
        parseNumericValue('-19', { unsigned: true, min: 0, max: 10 })
      ).toBe(10);
    });
  });
});
