import type React from "react";
import type { HTMLAttributes, PropsWithChildren } from "react";
import styled from "styled-components";

type Props = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    extra?: React.ReactNode;
  }
>;

const HeaderElement = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--c-spacing-md);
`;

export const HeaderContainer: React.FC<Props> = ({
  children,
  extra,
  ...props
}) => {
  return (
    <div id="header-container">
      <HeaderElement id="header" {...props}>
        <div id="page-title" className="flex">
          <h1 className="text-xl font-bold m-0">{children}</h1>
        </div>
        {extra}
      </HeaderElement>
    </div>
  );
};
