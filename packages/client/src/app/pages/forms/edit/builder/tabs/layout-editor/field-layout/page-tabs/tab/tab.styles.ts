import styled from 'styled-components';

export const TabWrapper = styled.div`
  box-shadow: 0 0 0 1px #cdd8e4, 0 2px 12px rgb(205 216 228 / 50%);

  padding: 4px 18px;
  border-radius: 4px 4px 0 0;
`;

export const NewTabWrapper = styled(TabWrapper)`
  justify-self: flex-end;
`;
