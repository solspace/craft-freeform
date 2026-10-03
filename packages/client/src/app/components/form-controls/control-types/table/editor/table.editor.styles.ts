import { BuilderTabsWrapper } from "@editor/builder/tabs/tabs.styles";
import { scrollBar } from "@ff-client/styles/mixins";
import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const OptionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  padding: 0 8px;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
`;

export const TextContainer = styled.div`
  display: flex;
  align-items: center;

  input:first-child {
    border-right: 1px solid rgba(0, 0, 0, 0.1);
  }
`;

const Button = styled.button`
  width: 20px;
  height: 20px;

  padding: 2px;
  margin: 0;
  border: 0;

  &:before {
    content: 'plus';

    color: ${colors.gray500};

    font-family: Craft;
    font-size: 15px;
    font-weight: 100;
    line-height: 15px;
  }
`;

export const AddButton = styled(Button)`
  right: 20px;

  &:before {
    content: 'plus';
  }
`;

export const RemoveButton = styled(Button)`
  &:before {
    content: 'minus';
  }
`;

export const CheckboxContainer = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 5px;

  padding: 0 8px;

  label {
    display: block;
  }
`;

export const TableColumnTabs = styled(BuilderTabsWrapper)`
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  align-self: stretch;

  padding: 0;
  box-shadow: none;

  ${scrollBar};

  a {
    cursor: pointer;

    display: flex;
    gap: var(--c-spacing-sm, 8px);
    flex: 0 0 auto;

    user-select: none;
  }
`;

export const TableColumnTabLabel = styled.span`
  display: block;

  max-width: 100px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const TableColumnTabsWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${spacings.sm};
  width: 100%;
  padding-inline: ${spacings.md};
`;

export const AddColumnButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex: 0 0 auto;

  width: 34px;
  height: 34px;
  margin-bottom: 8px;

  border: 1px solid rgba(51, 64, 77, 0.1);
  border-radius: ${borderRadius.md};

  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
`;

export const RemoveColumnButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 18px;
  height: 18px;
  padding: 0;
  margin-left: 2px;

  border: 1px solid transparent;
  border-radius: var(--c-radius-sm);
  background: transparent;
  color: var(--c-text-quiet);

  &:hover {
    color: var(--c-text-default);
    background: var(--c-color-neutral-fill-normal);
  }

  svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }
`;

export const ReorderColumnButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 18px;
  height: 18px;
  padding: 0;
  margin-left: auto;

  border: 1px solid transparent;
  border-radius: var(--c-radius-sm);
  background: transparent;
  color: var(--c-text-quiet);
  cursor: move;

  &:hover {
    color: var(--c-text-default);
    background: var(--c-color-neutral-fill-normal);
  }

  svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }
`;

export const FileKindOptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${spacings.sm};

  padding-top: ${spacings.sm};
`;
