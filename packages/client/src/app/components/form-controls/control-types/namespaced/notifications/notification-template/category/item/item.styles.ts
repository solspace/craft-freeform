import { editorButton } from "@ff-client/styles/craft6";
import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Name = styled.div`
  padding: ${spacings.sm} ${spacings.md};

  font-size: 14px;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const ButtonGroup = styled.div`
  display: flex;
  height: 100%;

  white-space: nowrap;

  background-color: light-dark(#e5ecf6, var(--ui-control-bg-color));
  border-top-right-radius: ${borderRadius.lg};
  border-bottom-right-radius: ${borderRadius.lg};
`;

export const Button = styled.button`
  ${editorButton}
  border: 0;
  border-radius: 0;
  min-width: var(--c-size-control-md);
  padding: 0;

  &:last-child {
    border-top-right-radius: ${borderRadius.lg};
    border-bottom-right-radius: ${borderRadius.lg};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const TemplateCard = styled.li`
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  min-width: 0;

  padding: 0;

  background-color: ${colors.gray050};
  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.lg};

  &.dashed {
    background-color: transparent;
    border: 1px dashed ${colors.gray300};

    &:hover {
      background-color: ${colors.gray100};
    }
  }

  &.active {
    color: var(--c-color-accent-on-quiet);
    background: var(--c-color-accent-fill-quiet);
    border-color: var(--c-color-accent-border-normal);

    ${ButtonGroup} { background: transparent; }
    ${Button} { color: inherit; background: transparent; }
    ${Button}:hover { background: var(--c-color-accent-fill-normal); color: var(--c-color-accent-on-normal); }
  }
`;
