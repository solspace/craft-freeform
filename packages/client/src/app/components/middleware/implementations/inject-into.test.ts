import { describe, expect, it, jest } from '@jest/globals';

import injectInto from './inject-into';

describe('injectInto middleware', () => {
  it('calls injector with correct arguments, returns self', () => {
    const callback = jest.fn();
    const result = injectInto(
      'My Test Value',
      { target: 'myProp' },
      undefined,
      callback
    );

    expect(result).toBe('My Test Value');

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith('myProp', 'My Test Value');
  });

  it('calls injector with camelize on and receives camelized string', () => {
    const callback = jest.fn();
    injectInto(
      'My Test Value',
      { target: 'myProp', camelize: true },
      undefined,
      callback
    );

    expect(callback).toHaveBeenCalledWith('myProp', 'myTestValue');
  });

  describe('conditional injector', () => {
    it('bypasses injector with condition that matches', () => {
      const callback = jest.fn();
      injectInto(
        'My Test Value',
        {
          target: 'myProp',
          bypassConditions: [{ name: 'myCondition', isTrue: true }],
        },
        { myCondition: true },
        callback
      );

      expect(callback).not.toHaveBeenCalled();
    });

    it('bypasses injector with several conditions with one matching', () => {
      const callback = jest.fn();
      injectInto(
        'My Test Value',
        {
          target: 'myProp',
          bypassConditions: [
            { name: 'myCondition', isTrue: true },
            { name: 'myCondition2', isTrue: true },
          ],
        },
        { myCondition2: true },
        callback
      );

      expect(callback).not.toHaveBeenCalled();
    });

    it('bypasses injector with several conditions that should not match', () => {
      const callback = jest.fn();
      injectInto(
        'My Test Value',
        {
          target: 'myProp',
          bypassConditions: [
            { name: 'myCondition', isTrue: false },
            { name: 'myCondition2', isTrue: false },
          ],
        },
        { myCondition: true, myCondition2: false },
        callback
      );

      expect(callback).not.toHaveBeenCalled();
    });

    it('calls injector when condition does not match', () => {
      const callback = jest.fn();
      injectInto(
        'My Test Value',
        {
          target: 'myProp',
          bypassConditions: [{ name: 'myCondition', isTrue: true }],
        },
        { myCondition2: true },
        callback
      );

      expect(callback).toHaveBeenCalledWith('myProp', 'My Test Value');
    });
  });
});
