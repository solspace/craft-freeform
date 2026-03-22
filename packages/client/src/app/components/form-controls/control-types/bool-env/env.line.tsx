import type { FC, PropsWithChildren } from "react";
import styled from "styled-components";

export const EnvLine: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Paragraph className="notice has-icon">
      <span className="icon" aria-hidden="true" />
      <span className="visually-hidden">Tip: </span>
      <span>{children}</span>
    </Paragraph>
  );
};

const Paragraph = styled.p`
  margin-top: 5px;
`;
