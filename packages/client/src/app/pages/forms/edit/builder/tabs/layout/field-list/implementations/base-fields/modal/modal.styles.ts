import {
  EditableLabelWrapper,
  LabelElement,
} from "@components/form-controls/control-types/label/label.styles";
import { sectionHeading, textControl } from "@ff-client/styles/craft6";
import { scrollBar } from "@ff-client/styles/mixins";
import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

interface GroupItemWrapperProps {
  $empty: string;
  color?: string;
}

interface EmptyProps {
  $empty: string;
}

export const ManagerWrapper = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: var(--background-color);

  @container (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
    > div {
      overflow: visible;
    }
  }
`;

export const GroupLayout = styled.div`
  position: relative;
  background-color: var(--c-surface-default, #fff);
  padding: ${spacings.md};
  border-radius: ${borderRadius.md};
  border: 1px solid var(--c-color-border-quiet);
  display: flex;
  gap: ${spacings.md};
`;

export const GroupWrapper = styled.div<EmptyProps>`
  padding: 25px ${spacings.lg};
  display: flex;
  flex-direction: column;
  gap: ${spacings.md};
  overflow-x: hidden;
  overflow-y: auto;
  ${scrollBar};

  &:empty::before {
    content: ${({ $empty }) => `"${$empty}"`};
    display: block;
  }
`;

GroupWrapper.defaultProps = {
  $empty: "Click the 'Add Group' button on the right to begin.",
};

export const GroupType = styled.div`
  flex: 1;
  min-width: 0;
  container-type: inline-size;
`;

export const GroupHeader = styled.div`
  display: flex;
  align-items: flex-start;
  padding-bottom: ${spacings.lg};
  gap: ${spacings.md};

  ${LabelElement} {
    ${sectionHeading}
  }

  ${EditableLabelWrapper} input.text {
    ${textControl}
    font-weight: 600;
  }
`;

export const GroupItemWrapper = styled.div<GroupItemWrapperProps>`
  display: grid;
  gap: 6px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  min-width: 0;
  border-radius: ${borderRadius.md};

  &:empty::before {
    content: ${({ $empty }) => `"${$empty}"`};
    display: block;
    grid-column: 1 / -1;
  }

  @container (max-width: 280px) {
    grid-template-columns: minmax(0, 1fr);
  }

  svg {
    fill: ${({ color }) => color || colors.black};
  }

  .remove {
    svg {
      fill: ${colors.black} !important;
    }
  }
`;

GroupItemWrapper.defaultProps = {
  $empty: "Drag and drop any field here",
  color: colors.black,
};

export const CloseAndMoveWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};
`;

export const FieldListWrapper = styled.div`
  padding: 25px ${spacings.lg};

  overflow-x: hidden;
  overflow-y: auto;
  ${scrollBar};
`;

export const FieldTypes = styled.div<EmptyProps>`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  min-width: 0;

  &:empty::before {
    content: ${({ $empty }) => `"${$empty}"`};
    display: block;
    grid-column: 1 / -1;
    padding: var(--c-spacing-md);
    border: 1px dashed var(--c-color-border-quiet);
    border-radius: var(--c-radius-md);
    color: var(--c-text-quiet);
  }

  @container (max-width: 280px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

FieldTypes.defaultProps = {
  $empty: "Drag and drop any field here",
};

export const UHFieldWrapper = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${spacings.xl};

  padding-top: ${spacings.lg};

  > .unassigned {
    .remove {
      display: none;
    }
  }
`;

export const UHField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.md};
  min-width: 0;
  container-type: inline-size;

  h3 {
    ${sectionHeading}
    margin: 0;
  }
`;

export const ColorCircle = styled.button`
  appearance: none;
  width: 20px;
  height: 20px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid var(--c-color-border-quiet);
  cursor: pointer;
  background-color: ${({ color }) => color || colors.black};
  position: relative;
`;

export const ColorPickerWrapper = styled.div`
  position: relative;
  flex: 0 0 auto;
`;

export const ColorPopover = styled.div`
  position: absolute;
  top: -6px;
  left: calc(100% + ${spacings.sm});
  z-index: 10;
  padding: ${spacings.sm};
  border: 1px solid var(--c-color-border-quiet);
  border-radius: ${borderRadius.md};
  background: var(--c-surface-overlay, #fff);
  box-shadow: 0 10px 24px rgb(32 51 72 / 14%);
`;

export const ErrorBlock = styled.div`
  color: ${colors.warning};
`;
