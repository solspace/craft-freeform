import { borderRadius, colors } from "@ff-client/styles/variables";
import translate from "@ff-client/utils/translations";
import type React from "react";
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
        className="btn add icon"
        onClick={onClick}
        disabled={disabled}
      >
        {translate(label)}
      </AddButton>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;

  background: transparent;
  border: 1px dashed rgba(0, 0, 0, 0.25);
  border-top: none;
  border-bottom-left-radius: ${borderRadius.lg};
  border-bottom-right-radius: ${borderRadius.lg};
`;

const AddButton = styled.button`
  width: 100%;
  padding: 6px 9px;

  background: ${colors.white};
  border-radius: 4px;

  text-align: center;
  cursor: pointer;

  &:before {
    margin-right: 6px;
  }

  &:hover {
    background: ${colors.gray050};
  }

  &:focus {
    outline: none;
    box-shadow: var(--inner-focus-ring);
  }

  &:disabled {
    background: #00000004;
    color: ${colors.gray300};
    cursor: not-allowed;
  }
`;
