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

  background-color: #e5ecf6;
  border-top-right-radius: ${borderRadius.lg};
  border-bottom-right-radius: ${borderRadius.lg};
`;

export const Button = styled.button`
  padding: ${spacings.sm} 10px;

  &:hover {
    background-color: ${colors.gray200};
  }

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
    color: ${colors.white};
    background-color: ${colors.gray500};

    button svg {
      fill: ${colors.white};
    }

    ${ButtonGroup} {
      background-color: #51606c;
    }

    ${Button} {
      &:hover {
        background-color: ${colors.gray800};
      }
    }
  }
`;
