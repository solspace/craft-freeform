import translate from "@ff-client/utils/translations";
import { createElement, type FC, type PropsWithChildren } from "react";
import styled from "styled-components";

export const EnvLine: FC<PropsWithChildren> = ({ children }) => (
  <Tip>
    {createElement(
      "craft-callout",
      {
        appearance: "plain",
        padding: "none",
        variant: "info",
        rounded: "all",
      },
      createElement("craft-visually-hidden", null, translate("Tip:")),
      children,
    )}
  </Tip>
);

const Tip = styled.div`
  margin: 0;
  color: var(--c-color-info-on-quiet);
`;
