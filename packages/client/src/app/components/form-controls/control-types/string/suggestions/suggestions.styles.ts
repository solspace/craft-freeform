import { scrollBar } from "@ff-client/styles/mixins";
import { borderRadius, colors, shadows } from "@ff-client/styles/variables";
import styled from "styled-components";

export const InputWithSuggestionsFieldWrapper = styled.div`
  position: relative;
`;

export const SuggestionsWrapper = styled.ul`
  position: absolute;
  z-index: 2;

  width: 100%;
  max-height: 300px;
  overflow-y: auto;

  padding: 0;
  margin: 0;

  background-color: light-dark(${colors.white}, ${colors.overlay});
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

  color: light-dark(${colors.gray400}, ${colors.muted});
  font-size: 11px;
  line-height: 1.2;
  text-transform: uppercase;
`;

export const ItemList = styled.ul``;

export const Dash = styled.span`
  display: inline-block;
  width: 8px;
  height: 1px;
  background-color: light-dark(${colors.gray400}, ${colors.inputBackground});
`;

export const ItemName = styled.span`
  flex: 0 0 auto;
  color: ${colors.gray700};
`;

export const Hint = styled.span`
  flex: 0 1 auto;
  color: light-dark(${colors.gray400}, ${colors.muted});
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
    background-color: light-dark(${colors.gray500}, var(--bg-selection-dark));

    ${ItemName}, ${Hint} {
      color: light-dark(${colors.white}, ${colors.text});
    }

    ${Dash} {
      background-color: light-dark(${colors.white}, ${colors.overlay});
    }
  }
`;
