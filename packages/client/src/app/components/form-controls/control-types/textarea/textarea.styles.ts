import styled from 'styled-components';

export const TextArea = styled.textarea`
  &.read-only {
    border: 1px solid rgba(0, 0, 0, 0.05);
    color: rgba(0, 0, 0, 0.5);

    user-select: none;
  }
`;
