import type { HTMLAttributes, PropsWithChildren } from 'react';
import React from 'react';

type Props = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    extra?: React.ReactNode;
  }
>;

export const HeaderContainer: React.FC<Props> = ({
  children,
  extra,
  ...props
}) => {
  if (!props.style) {
    props.style = { paddingLeft: 0, paddingRight: 0 };
  }

  return (
    <div id="header-container">
      <header id="header" {...props}>
        <div id="page-title" className="flex">
          <h1 className="screen-title">{children}</h1>
        </div>
        {extra}
      </header>
    </div>
  );
};
