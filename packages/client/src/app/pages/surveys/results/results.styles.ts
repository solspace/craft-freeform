import styled from 'styled-components';

type WrapperProps = {
  $highlightHighest: boolean;
};

export const ResultsWrapper = styled.div<WrapperProps>`
  --highlight: ${({ $highlightHighest }) =>
    $highlightHighest ? '#e02e39' : '#33414d'};
`;
