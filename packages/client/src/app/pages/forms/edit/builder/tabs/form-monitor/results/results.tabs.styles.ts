import { colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const TabContainer = styled.div``;

export const TabWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  gap: 4px;
`;

export const TabItem = styled.div`
  padding: 0 7px;
`;

export const TabButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacings.sm};
  background: none;
  border: none;
  color: ${colors.gray600};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  border-bottom: 2px solid ${colors.gray100};

  &:hover {
    color: ${colors.gray800};
  }

  &.active {
    color: ${colors.blue600};
    border-bottom-color: ${colors.blue600};
  }

  &:focus {
    outline: none;
  }
`;

export const TabContent = styled.div`
  padding-top: ${spacings.md};
`;
