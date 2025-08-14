import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const PreviewCardsList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 5px;

  min-height: 60px;
`;

export const PreviewCard = styled.li`
  display: grid;
  column-gap: 5px;
  row-gap: 0;
  grid-template-columns: 50px auto;
  grid-template-areas:
    'icon label'
    'icon description';

  padding: 5px;

  background: ${colors.white};
  border: 1px solid ${colors.gray200};
  border-radius: 5px;
`;

export const Image = styled.div`
  grid-area: icon;
  align-self: start;

  border: 1px solid ${colors.gray200};
  border-radius: 5px;
  overflow: hidden;
`;

export const Label = styled.div`
  grid-area: label;

  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Description = styled.div`
  grid-area: description;

  color: ${colors.gray300};
  font-size: 12px;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
`;
