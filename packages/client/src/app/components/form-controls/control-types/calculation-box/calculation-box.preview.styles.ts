import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

import { PreviewTable } from "../table/table.preview.styles";

export const PreviewContainer = styled(PreviewTable)`
  mark {
    padding: ${spacings.xs} ${spacings.sm};
    border-radius: ${borderRadius.lg};
    color: ${colors.text};
    background: var(--bg-selection-light, ${colors.gray100});
    box-shadow: inset 0 0 0 1px ${colors.border};
  }
`;
