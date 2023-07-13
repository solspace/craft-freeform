import { extractParameter } from './mapping.utilities';

describe('field-mapping.utilities', () => {
  describe('parameter extractor', () => {
    it('extracts simple parameter', () => {
      const ref = { foo: 'bar' };
      expect(extractParameter(ref, 'foo')).toEqual('bar');
    });

    it('extracts nested parameter', () => {
      const ref = { foo: { bar: 'baz' } };
      expect(extractParameter(ref, 'foo.bar')).toEqual('baz');
    });

    it('returns undefined on non-existing param value', () => {
      const ref = { foo: { bar: 'baz' } };
      expect(extractParameter(ref, 'foo.baz')).toBeUndefined();
    });
  });
});
