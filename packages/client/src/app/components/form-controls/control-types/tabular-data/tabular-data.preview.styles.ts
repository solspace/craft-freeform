import { PreviewEmpty } from "@components/form-controls/preview/property-preview.styles";
import { labelText } from "@ff-client/styles/mixins";
import { colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const NoContent = styled(PreviewEmpty)``;

export const PreviewWrapper = styled.div`
  min-width: 0;
`;

export const Header = styled.div`
  display: grid;
  grid-template-columns: 60% 40%;

  margin-bottom: ${spacings.md};

  ${labelText};
  font-size: 11px;
`;

export const PreviewTable = styled.div`
  min-width: 0;
`;

export const PreviewRow = styled.div`
  position: relative;

  display: grid;
  grid-template-columns: minmax(0, 1fr) 100px;
  gap: 10px;

  justify-items: stretch;
  align-items: center;

  border-bottom: 1px solid ${colors.gray100};

  &:after {
    content: attr(data-title);

    position: absolute;
    left: calc(100% - 105px);
    bottom: -7px;

    padding: 0 5px;
    background: ${colors.white};

    ${labelText};
    font-size: 8px;
  }

  > div {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;

    padding: 7px ${spacings.xs} 7px 0;

    &:last-child {
      padding-right: 0;
    }
  }
`;

export const PreviewData = styled.div`
  &:empty {
    &:after {
      content: attr(data-empty);
      color: ${colors.gray200};
      font-size: 12px;
      font-style: italic;
    }
  }
`;
