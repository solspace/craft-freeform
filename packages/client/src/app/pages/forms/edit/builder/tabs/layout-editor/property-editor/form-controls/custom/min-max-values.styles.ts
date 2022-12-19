import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;

  div {
    width: auto;
    display: flex;
  }
`;

const Input = styled.input`
  width: 100%;
  --focus-ring: 0;
`;

export const MinInput = styled(Input)`
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
`;

export const MaxInput = styled(Input)`
  border-left: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
`;
