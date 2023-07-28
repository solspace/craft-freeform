import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled.div``;

export const LabelWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  line-height: 22px;
`;

export const Label = styled.span`
  padding-left: ${spacings.md};
  font-weight: 700;
  font-size: 11px;
  color: ${colors.gray550};
  text-transform: uppercase;
`;

export const Button = styled.button`
  align-self: end;

  &:hover {
    background-color: ${colors.gray200};
  }
`;

export const NotificationItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};
  padding: ${spacings.xs} 0;

  &:empty {
    &:after {
      content: 'None configured';

      padding: 2px};
      margin-left: 12px;

      font-style: italic;
      font-size: 12px;

      color: ${colors.gray300};
    }
  }
`;
