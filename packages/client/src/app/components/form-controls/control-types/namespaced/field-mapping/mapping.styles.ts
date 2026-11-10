import { animations } from "@ff-client/styles/animations";
import { scrollBar } from "@ff-client/styles/mixins";
import { colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const RefreshButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;

  font-size: 16px;

  &[disabled] > svg {
    fill: light-dark(${colors.gray300}, ${colors.muted});

    animation: ${animations.spinner} 2s infinite;
    transform-origin: 50% 50%;
  }
`;

export const MappingWrapper = styled.div`
  display: grid;
  align-items: center;
  gap: ${spacings.sm};

  grid-template-columns: auto min-content 400px;

  padding: 2px 0;

  > div:first-child {
    flex-grow: 1;
  }

  > div:last-child {
    flex-basis: 300px;
  }
`;

export const MappingContainer = styled.div`
  max-width: 1000px;
  max-height: 454px;

  overflow-y: auto;
  overflow-x: hidden;

  border: 1px solid light-dark(rgb(205 216 228 / 50%), ${colors.border});
  border-radius: 5px;

  padding: ${spacings.sm} ${spacings.lg};

  ${scrollBar};
`;

export const MappingSearchWrapper = styled.div`
  max-width: 1000px;
  margin-bottom: 0px;
`;

export const SourceField = styled.div`
  position: relative;

  &:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;

    display: block;

    width: 100%;
    height: 1px;

    background-color: light-dark(${colors.gray100}, ${colors.border});
  }

  > span {
    position: relative;
    z-index: 2;

    display: block;
    padding: 0 10px 0 0;
    width: fit-content;

    background-color: light-dark(white, var(--pane-bg, #fff));
  }

  &.required > span {
    &:after {
      content: '*';
      position: relative;
      right: -2px;

      color: ${colors.error};
    }
  }
`;

export const TypeButtonGroup = styled.div`
  display: flex;
`;

const radius = "8px";

export const TypeButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 34px;
  height: 28px;

  fill: ${colors.gray550};
  color: ${colors.gray550};
  background-color: ${colors.elements.dropdown};

  &.active {
    fill: light-dark(${colors.gray050}, ${colors.text});
    color: light-dark(${colors.gray050}, ${colors.text});
    background-color: light-dark(${colors.gray550}, var(--bg-selection-dark));
  }

  &:first-child {
    border-top-left-radius: ${radius};
    border-bottom-left-radius: ${radius};
  }

  &:last-child {
    border-top-right-radius: ${radius};
    border-bottom-right-radius: ${radius};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const TwigInput = styled.input`
  &::placeholder {
    color: light-dark(${colors.gray250}, ${colors.muted});
  }
`;
