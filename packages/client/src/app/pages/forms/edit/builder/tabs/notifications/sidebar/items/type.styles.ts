import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled.div`
  margin: ${spacings.sm} 0 ${spacings.lg};
`;

export const LabelWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;

  padding-left: 3px;

  font-weight: 700;
  color: ${colors.gray550};
`;

export const Label = styled.span`
  flex-grow: 1;
  max-width: 90%;
  overflow: hidden;
`;

const iconSize = 20;
export const Icon = styled.div`
  display: block;
  width: ${iconSize}px;
  height: ${iconSize}px;

  fill: ${colors.gray550};
`;

export const Button = styled.button`
  align-self: end;
`;

export const NotificationItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};

  margin-top: ${spacings.sm};

  &:empty {
    &:after {
      content: 'Empty';

      padding: 2px ${spacings.xl};
      margin-left: 10px;

      font-style: italic;
      font-size: 12px;

      color: ${colors.gray200};
    }
  }
`;
