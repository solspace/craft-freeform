import type { HTMLAttributes, PropsWithChildren } from 'react';
import React from 'react';

export const ContentContainer: React.FC<
  PropsWithChildren<HTMLAttributes<HTMLDivElement>>
> = ({ children, ...props }) => {
  return (
    <div id="content-container">
      <div id="content" className="content-pane" {...props}>
        {children}
      </div>
    </div>
  );
};
