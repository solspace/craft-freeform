import { editorButton } from "@ff-client/styles/craft6";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { createElement } from "react";
import styled from "styled-components";

type Props = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

export const AddButtonArea: React.FC<Props> = ({
  label,
  onClick,
  disabled = false,
  className,
}) => {
  return (
    <Wrapper className={className}>
      <AddButton
        type="button"
        className="freeform-add-row"
        onClick={onClick}
        disabled={disabled}
      >
        {createElement("craft-icon", { name: "plus", "aria-hidden": true })}
        {translate(label)}
      </AddButton>
    </Wrapper>
  );
};

const Wrapper = styled.div.attrs({ className: "freeform-add-button-area" })`
  width: 100%;
  display: flex;
  margin-top: var(--c-spacing-md);
`;

const AddButton = styled.button`
  ${editorButton}
  width: 100%;
  border: 1px dashed var(--c-form-control-border-color);
  background: var(--c-surface-default);
  font-weight: 400;
  craft-icon { width: 16px; height: 16px; flex: none; }
`;
