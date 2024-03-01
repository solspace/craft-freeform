import { generateRandomHash } from './hash';

describe('hash', () => {
  describe('generateRandomHash', () => {
    it('generates a random 8 character hash by default', () => {
      expect(generateRandomHash()).toHaveLength(8);
    });

    it('generates random hash with specified length', () => {
      expect(generateRandomHash(16)).toHaveLength(16);
      expect(generateRandomHash(32)).toHaveLength(32);
      expect(generateRandomHash(64)).toHaveLength(64);
      expect(generateRandomHash(128)).toHaveLength(128);
    });
  });
});
