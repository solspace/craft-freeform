import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Header = styled.header`
  display: grid;
  grid-template-areas: 'title sites views button';
  grid-template-columns: min-content 1fr max-content auto;
  justify-content: space-between;
  align-items: center;
  gap: ${spacings.md};

  @media (max-width: 1100px) {
    grid-template-areas: 'title button' 'views views';
    grid-template-columns: 1fr auto;
  }
  @media (max-width: 600px) {
    grid-template-areas: 'title' 'views' 'button';
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Title = styled.h1`
  grid-area: title;

  padding: ${spacings.sm} 0;
  margin: 0;

  font-size: 18px;
  font-weight: 700;
  line-height: 34px;
`;

export const ButtonGroup = styled.div`
  grid-area: button;
  display: flex;
  align-items: center;
  gap: ${spacings.sm};
`;

export const Button = styled.button`
  flex-shrink: 0;
`;

export const ViewButtons = styled.section`
`;

export const ViewControls = styled.div`
  grid-area: views;
  display: flex;
  align-items: center;
  gap: ${spacings.md};
`;
