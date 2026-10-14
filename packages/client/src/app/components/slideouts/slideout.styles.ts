import { colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const SlideoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  container-type: inline-size;
  background: var(--modal-bg, #fff);
`;

export const SlideoutHeader = styled.header.attrs({ className: "pane-header" })`
  && {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 0 0 auto;
    gap: ${spacings.md};
    margin: 0;
    padding: ${spacings.lg};
    border-radius: 0;
    border-bottom: 1px solid ${colors.hairline};
    background: var(--gray-100, #e4edf6);
    box-shadow: none;
  }

  h1 {
    margin: 0;
    font-size: 20px;
  }

  button svg {
    display: block;
    width: 12px;
    height: 12px;
    fill: currentColor;
  }
`;

export const SlideoutFooter = styled.footer.attrs({ className: "so-footer" })`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: ${spacings.sm};
  margin: 0;
  padding: ${spacings.sm} ${spacings.lg};
  border-top: 1px solid ${colors.hairline};
  background: var(--slideout-footer-bg, var(--gray-100, #e4edf6));
`;
