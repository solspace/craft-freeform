import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const MappingWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${spacings.sm};

  width: 70%;
  padding: 2px 0;

  > div:first-child {
    flex-grow: 1;
  }

  > div:last-child {
    flex-basis: 300px;
  }
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

    background-color: ${colors.gray100};
  }

  > span {
    position: relative;
    z-index: 2;

    display: block;
    padding: 0 10px 0 0;
    width: fit-content;

    background-color: white;
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

const radius = '8px';

export const TypeButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 34px;
  height: 28px;

  fill: ${colors.gray550};
  background-color: ${colors.gray200};

  border-left: 1px solid transparent;

  &.active {
    fill: ${colors.gray050};
    background-color: ${colors.gray550};
  }

  &:first-child {
    border-top-left-radius: ${radius};
    border-bottom-left-radius: ${radius};

    border-left: 1px solid #ccc;
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
