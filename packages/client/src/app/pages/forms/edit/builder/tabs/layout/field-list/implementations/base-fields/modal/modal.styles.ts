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
  background: ${colors.mutedSurface};
  flex: 1;
  min-height: 0;
  overflow: auto;
  @container (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
    > div { overflow: visible; }
  }
`;

export const GroupLayout = styled.div`
  position: relative;
  background-color: ${colors.overlay};
  padding: ${spacings.md};
  border-radius: ${borderRadius.md};
  border: 1px solid ${colors.hairline};
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
`;

export const GroupHeader = styled.div`
  display: flex;
  align-items: flex-start;
  padding-bottom: ${spacings.lg};
  gap: ${spacings.lg};
`;

export const GroupItemWrapper = styled.div<GroupItemWrapperProps>`
  display: grid;
  gap: 6px;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
  border-radius: ${borderRadius.md};

  &:empty {
    min-height: 72px;
    padding: ${spacings.md};
    box-sizing: border-box;
    color: ${colors.muted};
    background: ${colors.inputBackground};
    border: 1px dashed ${colors.inputBorder};
  }

  &:empty::before {
    content: ${({ $empty }) => `"${$empty}"`};
    display: block;
  }

  svg {
    fill: ${({ color }) => (!color || /^#(?:000|000000)$|^black$/i.test(color) ? colors.text : color)};
  }

  .remove {
    svg {
      fill: ${colors.text} !important;
    }
  }
`;

GroupItemWrapper.defaultProps = {
  $empty: "Drag and drop any field here",
  color: colors.text,
};

export const CloseAndMoveWrapper = styled.div`
  fill: currentColor;
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};
  color: ${colors.muted};

  > button {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 0;
    border-radius: ${borderRadius.sm};
    color: inherit;
    background: transparent;
    cursor: pointer;
    svg { display: block; width: 14px; height: 14px; }
    &:hover { color: ${colors.text}; background: var(--ui-control-hover-bg-color); }
    &:focus-visible { outline: 2px solid ${colors.link}; outline-offset: 1px; }
  }
`;

export const FieldListWrapper = styled.div`
  padding: 25px ${spacings.lg};

  overflow-x: hidden;
  overflow-y: auto;
  ${scrollBar};
`;

export const FieldTypes = styled.div<EmptyProps>`
  svg { fill: currentColor; }
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};
  min-height: 96px;
  padding: ${spacings.md};
  box-sizing: border-box;
  border: 1px dashed ${colors.inputBorder};
  border-radius: ${borderRadius.md};
  background: ${colors.surface};

  &:empty::before {
    content: ${({ $empty }) => `"${$empty}"`};
    display: block;
    color: ${colors.muted};
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
  padding: ${spacings.xs} ${spacings.xs} ${spacings.xs} ${spacings.md};
`;

export const ColorCircle = styled.button`
  appearance: none;
  width: 20px;
  height: 20px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid ${colors.border};
  cursor: pointer;
  background-color: ${({ color }) => color || colors.text};
  position: relative;
`;

export const ColorPickerWrapper = styled.div`
  position: relative;
  flex: 0 0 auto;
`;

export const ColorPopover = styled.div`
  width: 252px;
  max-width: calc(100vw - 32px);
  position: absolute;
  top: -6px;
  left: calc(100% + ${spacings.sm});
  z-index: 10;
  padding: ${spacings.sm};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  background: ${colors.overlay};
  box-shadow: var(--menu-shadow, var(--modal-shadow, 0 8px 24px rgb(0 0 0 / 16%)));
`;

export const ErrorBlock = styled.div`
  color: ${colors.warning};
`;
