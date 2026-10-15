import ExclamationIcon from "@ff-icons/actions/exclamation";
import type React from "react";

import { Message, Wrapper } from "./error-block.styles";

type Props = {
  children: React.ReactNode;
};

export const ErrorBlock: React.FC<Props> = ({ children }) => {
  return (
    <Wrapper role="alert">
      <ExclamationIcon aria-hidden="true" focusable="false" />
      <Message>{children}</Message>
    </Wrapper>
  );
};
