import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

type TabWrapperProps = {
  active?: boolean;
};

export const TabWrapper = styled.div<TabWrapperProps>`
  box-shadow: 0 0 0 1px #cdd8e4, 0 2px 12px rgb(205 216 228 / 50%);

  padding: 4px 18px;
  border-radius: 4px 4px 0 0;
  background: ${({ active }) => (active ? colors.gray050 : 'white')};

  &:hover {
    cursor: pointer;
  }
`;

export const NewTabWrapper = styled(TabWrapper)`
  justify-self: flex-end;
`;
