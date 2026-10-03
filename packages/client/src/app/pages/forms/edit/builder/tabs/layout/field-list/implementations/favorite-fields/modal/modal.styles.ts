import { sidebarItem } from "@components/layout/sidebar/sidebar";
import {
  Title,
  Icon as TitleIcon,
} from "@editor/builder/tabs/layout/property-editor/property-editor.styles";
import { SectionBlockContainer } from "@editor/builder/tabs/layout/property-editor/section-block.styles";
import { sectionHeading } from "@ff-client/styles/craft6";
import { errorAlert, scrollBar } from "@ff-client/styles/mixins";
import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const FavoritesWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: var(--background-color);

  @container (max-width: 600px) {
    flex-direction: column;
  }
`;

const titleIconSize = 22;

export const FavoritesEditorWrapper = styled.div`
  flex: 1;

  min-width: 0;
  min-height: 0;
  padding: 0 ${spacings.lg};

  overflow-x: hidden;
  overflow-y: auto;
  ${scrollBar};

  ${Title} {
    padding-left: 0;
    ${sectionHeading}

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
      background-color: var(--background-color);
      color: var(--c-text-quiet);
    }
  }
`;

export const FieldList = styled.ul`
  flex: 0 0 220px;
  min-height: 0;

  @container (max-width: 600px) {
    flex-basis: auto;
    max-height: 180px;
  }

  display: flex;
  flex-direction: column;
  gap: 2px;

  box-sizing: border-box;
  margin: 0;
  padding: ${spacings.sm};
  list-style: none;

  overflow-y: auto;
  overflow-x: hidden;

  background: var(--background-color);
  border-inline-end: 1px solid var(--c-color-border-quiet);

  @container (max-width: 600px) {
    border-inline-end: 0;
    border-bottom: 1px solid var(--c-color-border-quiet);
  }

  ${scrollBar};
`;

export const FieldListItem = styled.li`
  cursor: pointer;
  position: relative;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;

  width: 100%;
  box-sizing: border-box;
  padding: ${spacings.xs} ${spacings.xs} ${spacings.xs} ${spacings.md};

  border: 1px solid transparent;
  border-radius: ${borderRadius.lg};
  font-size: var(--c-text-base);

  user-select: none;
  transition: all 0.2s ease-in-out;

  > span {
    flex: 1;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  ${sidebarItem}

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
