import { SvgTag } from "@ff-client/utils/svg";
import type { FC, PropsWithChildren } from "react";
import { Message } from "../error/error-block.styles";
import { Wrapper } from "./info-block.styles";

export const InfoBlock: FC<PropsWithChildren> = ({ children }) => (
  <Wrapper role="status">
    <SvgTag viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 11v6M12 7v.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </SvgTag>
    <Message>{children}</Message>
  </Wrapper>
);
