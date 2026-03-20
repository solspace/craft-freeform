import { scrollBar } from "@ff-client/styles/mixins";
import { borderRadius, colors, shadows } from "@ff-client/styles/variables";
import styled from "styled-components";

export const SuggestionsWrapper = styled.ul`
  position: absolute;
  z-index: 2;

  width: 100%;
  max-height: 300px;
  overflow-y: auto;

  padding: 0;
  margin: 0;

  background-color: ${colors.white};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.autosuggest};

  ${scrollBar};
`;

export const SuggestionCategory = styled.li`
  padding-top: 8px;
`;

export const Title = styled.div`
  margin: 14px 0 3px;
  padding: 0 14px;

  color: ${colors.gray400};
  font-size: 11px;
  line-height: 1.2;
  text-transform: uppercase;
`;

export const ItemList = styled.ul``;

export const Dash = styled.span`
  display: inline-block;
  width: 8px;
  height: 1px;
  background-color: ${colors.gray400};
`;

export const ItemName = styled.span`
  flex: 0 0 auto;
  color: ${colors.gray700};
`;

export const Hint = styled.span`
  flex: 0 1 auto;
  color: ${colors.gray400};
`;

export const Item = styled.li`
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: 10px;

  padding: 10px 14px;

  overflow-x: hidden;

  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    background-color: ${colors.gray500};

    ${ItemName}, ${Hint} {
      color: ${colors.white};
    }

    ${Dash} {
      background-color: ${colors.white};
    }
  }
`;
