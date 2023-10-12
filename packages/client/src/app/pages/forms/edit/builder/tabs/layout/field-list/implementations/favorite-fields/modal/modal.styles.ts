import {
  Icon as TitleIcon,
  Title,
} from '@editor/builder/tabs/layout/property-editor/property-editor.styles';
import { SectionBlockContainer } from '@editor/builder/tabs/layout/property-editor/section-block.styles';
import { errorAlert, scrollBar } from '@ff-client/styles/mixins';
import {
  borderRadius,
  colors,
  shadows,
  spacings,
} from '@ff-client/styles/variables';
import styled from 'styled-components';

export const FavoritesWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  height: 600px;
`;

const titleIconSize = 22;

export const FavoritesEditorWrapper = styled.div`
  flex: 1;

  height: 100%;
  padding: 0 ${spacings.lg};

  overflow-x: hidden;
  overflow-y: auto;
  ${scrollBar};

  ${Title} {
    padding-left: 0;
    font-size: 20px;

    ${TitleIcon} {
      width: ${titleIconSize}px;
      height: ${titleIconSize}px;

      svg {
        max-width: ${titleIconSize}px;
        max-height: ${titleIconSize}px;
      }
    }
  }

  ${SectionBlockContainer} {
    &:after {
      background-color: white;
    }
  }
`;

export const FieldList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 2px;

  padding: ${spacings.sm};

  overflow-y: auto;
  overflow-x: hidden;

  background: ${colors.gray050};
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

  border: 1px solid transparent;
  border-radius: ${borderRadius.lg};
  font-size: 16px;

  user-select: none;
  transition: all 0.2s ease-in-out;

  > span {
    flex: 1;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    background-color: ${colors.gray200};
  }

  &.active {
    background: ${colors.gray500};
    color: ${colors.white};
    fill: currentColor;
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
