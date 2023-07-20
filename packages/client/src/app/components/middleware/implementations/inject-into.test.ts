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
});
