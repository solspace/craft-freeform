import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Header = styled.header`
  display: grid;
  grid-template-areas: 'title sites views button';
  grid-template-columns: min-content 1fr max-content auto;
  justify-content: space-between;
  align-items: center;
  gap: ${spacings.sm};

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
  flex-shrink: 0;

  .btn {
    padding-inline: 10px;
  }

  .btn::before {
    opacity: 0.8;
  }
`;

export const ViewControls = styled.div`
  grid-area: views;
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
  align-items: center;
  gap: ${spacings.sm};
`;

export const SearchWrapper = styled.div`
  flex: 1 1 200px;
  width: 240px;
  min-width: 0;
  max-width: 280px;

  input[type='search'] {
    box-sizing: border-box;
    height: var(--ui-control-height, 34px);
    min-height: var(--ui-control-height, 34px);
    border-radius: var(--radius-lg, 5px);
  }

  input::placeholder {
    color: var(--light-text-color, #596673);
  }

  .texticon-icon::before {
    opacity: 0.8;
  }

  input[type='search']::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }

  @media (max-width: 600px) {
    flex-basis: 100%;
    width: 100%;
    max-width: none;
  }
`;
