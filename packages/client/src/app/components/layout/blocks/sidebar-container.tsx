import type { HTMLAttributes, PropsWithChildren } from 'react';
import React from 'react';

export const SidebarContainer: React.FC<
  PropsWithChildren<HTMLAttributes<HTMLDivElement>>
> = ({ children, ...props }) => {
  return (
    <div id="sidebar-container">
      <div id="sidebar" className="sidebar" {...props}>
        {children}
      </div>
    </div>
  );
};
