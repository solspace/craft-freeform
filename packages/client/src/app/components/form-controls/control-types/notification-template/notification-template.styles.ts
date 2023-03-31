import { animated } from 'react-spring';
import { scrollBar } from '@ff-client/styles/mixins';
import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const NotificationTemplateSelector = styled(animated.div)`
  display: flex;
  flex-direction: column;
  gap: 0;

  padding: 0;

  border: 1px solid ${colors.inputBorder};
  border-radius: ${borderRadius.lg};

  overflow: hidden;
`;

type SelectedNotificationProps = {
  empty?: boolean;
};

export const SelectedNotification = styled.div<SelectedNotificationProps>`
  position: relative;
  cursor: pointer;

  height: 36px;

  flex: 1 0 36px;
  padding: 7px ${spacings.sm};

  overflow: hidden;

  ${({ empty }) =>
    empty &&
    `
    color: ${colors.gray300};
    font-style: italic;
    `}

  > span {
    &:empty {
      &:after {
        content: 'Select a notification template';
        color: ${colors.gray300};
        font-style: italic;
      }
    }
  }

  > svg {
    position: absolute;
    right: 10px;
    top: calc(50% - 10px);

    display: block;

    width: 20px;
    height: 20px;

    transition: transform 0.2s ease-in-out;
  }

  &.open {
    > svg {
      transform: rotate(-90deg);
    }
  }
`;

export const CategorySelectionWrapper = styled(animated.div)`
  display: flex;
  flex-direction: column;
  gap: ${spacings.lg};

  height: 100%;
  padding: ${spacings.sm} ${spacings.lg} ${spacings.sm} ${spacings.sm};

  border-top: 1px solid ${colors.inputBorder};
  overflow-y: auto;
  overflow-x: hidden;

  ${scrollBar};
`;

export const ButtonRow = styled(animated.div)`
  display: flex;
  gap: ${spacings.sm};

  border-top: 1px solid ${colors.inputBorder};

  padding: ${spacings.sm};
`;
