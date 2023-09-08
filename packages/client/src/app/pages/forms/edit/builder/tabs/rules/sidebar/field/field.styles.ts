import { animated } from 'react-spring';
import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const FieldInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  gap: ${spacings.sm};

  svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
`;

export const Label = styled.label`
  flex: 1;
  display: block;

  padding: 1px 0;
  line-height: 12px;
  font-size: 12px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Icon = styled.div`
  flex: 0 0 auto;

  width: 16px;
  height: 16px;
`;

export const GroupWrapper = styled.div``;

export const FieldWrapper = styled(animated.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${spacings.sm};

  flex: 1;

  overflow: hidden;
  padding: 5px 7px;

  width: 100%;
  height: 100%;

  background: ${colors.gray100};
  border: 1px solid ${colors.gray100};
  border-radius: ${borderRadius.md};

  transition: all 0.2s ease-out;

  &,
  * {
    cursor: pointer;
  }

  &.has-rule:not(.active) {
    border-color: ${colors.teal550};
    background-color: ${colors.teal050};
  }

  &.group {
    background-color: ${colors.white};
    border-color: ${colors.gray100};

    > ${FieldInfo} ${Icon} {
      display: none;
    }

    ${GroupWrapper} {
      color: ${colors.gray800};
    }
  }

  &:hover {
    background-color: ${colors.gray200};
    border-color: ${colors.gray200};
  }

  &.active {
    background-color: #5b6573;
    border-color: #5b6573;
    color: white;
  }

  &.is-in-condition {
    position: relative;

    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2;

      width: 0;
      border-left: 10px solid transparent;
      border-bottom: 10px solid transparent;
      border-left: 10px solid ${colors.gray200};
    }

    &-active:after {
      border-left-color: ${colors.teal550};
    }
  }
`;
