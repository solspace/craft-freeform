import styled from "styled-components";

export const CellBadgesWrapper = styled.div`
  display: flex;
  flex-direction: row;

  align-items: center;
  gap: 4px;
  margin-right: 4px;

  button { display: inline-flex; border: 0; padding: 0; background: transparent; }
  button:focus-visible { outline: 2px solid #5782ef; outline-offset: 2px; border-radius: 2px; }
  svg { width: 16px; height: 16px; }
`;
