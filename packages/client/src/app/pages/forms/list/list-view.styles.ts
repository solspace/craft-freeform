import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const PageLayout = styled.div`
  min-height: calc(100dvh - var(--cp-header-height) - 16px);
  padding: 16px;
`;

export const HeaderContainer = styled.div`
  container-type: inline-size;
`;

export const Header = styled.header`
  --forms-control-height: var(--ui-control-height, 34px);

  display: grid;
  grid-template-areas: 'title views button';
  grid-template-columns: min-content minmax(0, 1fr) auto;
  justify-content: space-between;
  align-items: center;
  gap: ${spacings.md} ${spacings.sm};
  margin-bottom: 12px;

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: var(--forms-control-height);
  }

  @container (max-width: 680px) {
    grid-template-areas: 'title button' 'views views';
    grid-template-columns: 1fr auto;
  }
  @container (max-width: 600px) {
    --forms-control-height: 44px;

    grid-template-columns: minmax(0, 1fr) auto;
  }
`;

export const Title = styled.h1`
  grid-area: title;

  padding: ${spacings.sm} 0;
  margin: 0;

  font-size: 20px;
  font-weight: 700;
  line-height: 34px;
`;

export const ButtonGroup = styled.div`
  grid-area: button;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${spacings.sm};
`;

export const Button = styled.button`
  flex-shrink: 0;
`;

export const ViewButtons = styled.section`
  display: inline-flex;
  flex-shrink: 0;

  .btn {
    min-width: var(--forms-control-height);
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
  justify-content: flex-end;
  gap: ${spacings.sm};

  @container (max-width: 680px) {
    justify-content: flex-start;
  }
`;

export const SearchWrapper = styled.div`
  flex: 1 1 200px;
  width: 240px;
  min-width: 0;
  max-width: 280px;

  input[type='search'] {
    box-sizing: border-box;
    height: var(--forms-control-height);
    min-height: var(--forms-control-height);
    border: 1px solid var(--c-form-control-border-color);
    border-radius: var(--c-form-control-radius);
    background: var(--c-form-control-fill);
    box-shadow: var(--c-input-shadow);
    color: var(--c-text-default);
    font: inherit;
    padding: 0 32px;
  }

  input::placeholder {
    color: var(--light-text-color, #596673);
  }

  .texticon-icon::before {
    opacity: 0.8;
  }

  .texticon-icon,
  .clear-btn {
    top: 50%;
    transform: translateY(-50%);
  }

  input[type='search']::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }

  @container (max-width: 600px) {
    flex-basis: 100%;
    width: 100%;
    max-width: none;

    input[type='search'] {
      font-size: 16px;
    }
  }
`;
