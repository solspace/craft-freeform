import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const PreviewCardsList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const PreviewCard = styled.li`
  display: grid;
  column-gap: 8px;
  row-gap: 0;
  grid-template-columns: 40px minmax(0, 1fr);
  grid-template-areas:
    'icon label'
    'icon description';

  padding: 8px 0;
  border-bottom: 1px solid ${colors.gray100};
  &:first-child { padding-top: 0; }
  &:last-child { border-bottom: 0; padding-bottom: 0; }
`;

export const Image = styled.div`
  grid-area: icon;
  align-self: start;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid ${colors.gray200};
  border-radius: 5px;
  overflow: hidden;
  width: 40px;
  height: 40px;
  background: ${colors.gray050};

  img, svg { width: 100%; height: 100%; object-fit: cover; }
  svg { fill: ${colors.gray400}; padding: 5px; box-sizing: border-box; }
`;

export const Label = styled.div`
  grid-area: label;

  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Description = styled.div`
  grid-area: description;

  color: ${colors.gray300};
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SpinnerWrapper = styled.div`
  width: 20px;
  height: 20px;
  margin: 8px 0;

  svg {
    animation: spin 1s linear infinite;
    fill: ${colors.gray400};
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
