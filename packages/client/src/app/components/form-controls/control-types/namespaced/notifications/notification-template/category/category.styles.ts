import { breakpoints } from '@ff-client/styles/breakpoints';
import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const TemplateCategoryWrapper = styled.div``;

export const Title = styled.h3`
  cursor: pointer;

  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 2px;

  padding: 0;
  margin: 0 0 ${spacings.sm};

  user-select: none;

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const TemplateList = styled.ul`
  position: relative;

  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: ${spacings.sm};

  ${breakpoints.desktop.sm} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${breakpoints.desktop.md} {
    grid-template-columns: repeat(3, 1fr);
  }

  padding-left: 25px;

  &:before {
    content: '';

    position: absolute;
    left: 8px;
    top: -5px;
    bottom: 0px;

    display: block;

    width: 4px;
    background-color: ${colors.gray050};
  }
`;

export const Collapser = styled.div`
  display: block;
  transition: transform 0.2s ease-in-out;

  svg {
    width: 14px;
    height: 14px;
  }

  &.collapsed {
    transform: rotate(90deg);
  }
`;
