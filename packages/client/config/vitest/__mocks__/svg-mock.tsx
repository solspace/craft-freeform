import * as React from 'react';

const SvgrMock = React.forwardRef<HTMLSpanElement>((props, ref) => (
  <span ref={ref} {...props} />
));
SvgrMock.displayName = 'SvgrMock';

export default SvgrMock;
