import translate from "@ff-client/utils/translations";
import type React from "react";

import { Avg, Max, Wrapper } from "./average.styles";

type Props = {
  average?: number;
  max?: number;
};

export const Average: React.FC<Props> = ({ average, max }) => {
  if (average === null || max === null) {
    return null;
  }

  return (
    <Wrapper>
      {translate("Average")}: <Avg>{average}</Avg> <Max>/ {max}</Max>
    </Wrapper>
  );
};
