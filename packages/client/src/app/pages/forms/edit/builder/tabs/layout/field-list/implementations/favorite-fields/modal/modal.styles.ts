import {
  Icon as TitleIcon,
  Title,
} from '@editor/builder/tabs/layout/property-editor/property-editor.styles';
import { errorAlert, scrollBar } from '@ff-client/styles/mixins';
import { colors, shadows, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const FavoritesWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  height: 600px;
`;

const titleIconSize = 26;

export const FavoritesEditorWrapper = styled.div`
  flex: 1;

  height: 100%;
  padding: 0 ${spacings.lg};

  background-color: ${colors.gray050};

  overflow-x: hidden;
  overflow-y: auto;
  ${scrollBar};

  ${Title} {
    padding-left: 0;
    font-size: 24px;

    ${TitleIcon} {
      width: ${titleIconSize}px;
      height: ${titleIconSize}px;

      svg {
        max-width: ${titleIconSize}px;
        max-height: ${titleIconSize}px;
      }
    }
  }
`;

export const FieldList = styled.ul`
  overflow-y: auto;
  overflow-x: hidden;

  box-shadow: ${shadows.right};

  ${scrollBar};
`;

export const FieldListItem = styled.li`
  cursor: pointer;
  position: relative;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;

  width: 250px;
  padding: ${spacings.xs} ${spacings.xs} ${spacings.xs} ${spacings.md};

  border-bottom: 1px solid ${colors.gray200};
  font-size: 16px;

  user-select: none;

  > span {
    flex: 1;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${colors.gray100};
  }

  &.active {
    background: ${colors.gray200};
  }

  &.errors {
    color: ${colors.error};
    fill: currentColor;

    ${errorAlert};
  }
`;

export const Icon = styled.div`
  font-size: 10px;

  &,
  svg {
    height: 20px;
    width: 20px;
  }
`;

export const DeleteButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
`;
