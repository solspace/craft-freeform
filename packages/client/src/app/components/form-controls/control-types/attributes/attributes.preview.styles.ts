import { labelText, scrollBar } from '@ff-client/styles/mixins';
import {
  borderRadius,
  colors,
  shadows,
  spacings,
} from '@ff-client/styles/variables';
import styled from 'styled-components';

export const PreviewWrapper = styled.div`
  min-height: 160px;
  max-height: 260px;
  overflow-x: hidden;
  overflow-y: auto;

  padding: ${spacings.sm} ${spacings.md};

  background: ${colors.white};
  box-shadow: ${shadows.box};
  border-radius: ${borderRadius.lg};

  ${scrollBar};
`;

export const AttributeTitle = styled.div`
  ${labelText};
  font-size: 10px;
`;

export const AttributeList = styled.ul`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: ${spacings.xs};

  margin-top: ${spacings.xs};
`;

export const AttributeItem = styled.li`
  padding: 1px 6px;

  font-family: monospace;
  font-size: 12px;

  background: ${colors.gray100};
  color: ${colors.gray800};
  border-radius: ${borderRadius.lg};
`;

export const AttributeListWrapper = styled.div`
  &:not(:last-child) {
    padding-bottom: 10px;
    margin-bottom: 10px;
    box-shadow: ${shadows.bottom};
  }

  &.empty {
    ${AttributeTitle} {
      &:after {
        content: 'empty';

        padding: 2px 8px;
        margin-left: 10px;

        font-style: italic;

        background-color: ${colors.gray050};
        border-radius: ${borderRadius.lg};
      }
    }
  }
`;
