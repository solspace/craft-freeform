import styled from "styled-components";

export const SlideoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
  background: var(--c-modal-fill, #fff);
`;

export const SlideoutHeader = styled.header.attrs({ className: "pane-header" })`
  flex: 0 0 auto;
  padding: var(--c-spacing-lg, 24px);
  border-bottom: 1px solid var(--c-border-default, #e3e7ed);

  h1 {
    margin: 0;
  }
`;

export const SlideoutFooter = styled.footer.attrs({
  className: "slideout__footer",
})`
  flex: 0 0 auto;
`;
