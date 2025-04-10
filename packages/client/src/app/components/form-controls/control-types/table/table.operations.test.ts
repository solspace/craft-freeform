import { cleanColumns } from './table.operations';

describe('attributes -> table', () => {
  describe('cleanColumns()', () => {
    it('clears all values with empty label and value', () => {
      expect(
        cleanColumns([
          { label: '', type: 'text', value: '' },
          { label: 'Some', type: 'text', value: '' },
          { label: '', type: 'text', value: 'Value' },
          { label: 'Some', type: 'text', value: 'Value' },
        ])
      ).toEqual([
        { label: 'Some', type: 'text', value: '' },
        { label: '', type: 'text', value: 'Value' },
        { label: 'Some', type: 'text', value: 'Value' },
      ]);
    });
  });
});
