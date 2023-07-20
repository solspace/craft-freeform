import { handle } from '.';

describe('handle middleware', () => {
  it('generates a proper handle value', () => {
    const string = 'ThisIs a RaNDoM_String 55 -=!?+_-"\'';

    const result = handle(string);

    expect(result).toEqual('ThisIsaRaNDoM_String55-_-');
  });

  it('does not escape underscores and dashes', () => {
    const string = 'this_is-underscored$!#@%^&*';

    const result = handle(string);

    expect(result).toEqual('this_is-underscored');
  });
});
