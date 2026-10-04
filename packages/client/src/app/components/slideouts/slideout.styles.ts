import { sectionHeading } from "@ff-client/styles/craft6";
import styled from "styled-components";

export const SlideoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  color: var(--c-text-default);
  background: var(--c-modal-fill, #fff);

  --background-color: color-mix(in srgb, var(--c-surface-default, #fff) 98%, var(--c-text-default, #2b3549));
`;

export const SlideoutHeader = styled.header.attrs({ className: "pane-header" })`
  // Override the legacy pane header's negative margins and compact padding.
  && {
    flex: 0 0 auto;
    margin: 0;
    padding: var(--c-spacing-lg, 24px);
    border-radius: 0;
    border-bottom: 1px solid var(--c-color-border-quiet);
    background: var(--c-modal-fill, #fff);
    box-shadow: none;
  }

  h1 {
    ${sectionHeading}
    margin: 0;
    padding: 0;
    font-size: var(--c-text-xl, 20px);
  }
`;

export const SlideoutFooter = styled.footer.attrs({
  className: "slideout__footer",
})`
  && {
    flex: 0 0 auto;
    margin: 0;
    padding: var(--c-spacing-md, 16px) var(--c-spacing-lg, 24px);
    border-top: 1px solid var(--c-color-border-quiet);
    background: var(--c-modal-fill, #fff);
  }

  && > .btn {
    border: 1px solid transparent;
    background: transparent;
    color: var(--c-text-default);
    box-shadow: none;
  }

  && > .btn:hover:not(:disabled) {
    background: var(--c-color-neutral-fill-normal);
  }

  && > .btn.submit {
    background: var(--c-color-accent-fill-loud);
    color: var(--c-color-accent-on-loud);
  }

  && > .btn.submit:hover:not(:disabled) {
    background: hsl(from var(--c-color-accent-fill-loud) h s calc(l - 5));
    color: var(--c-color-accent-on-loud);
  }

  && > .btn:focus-visible {
    outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
    outline-offset: var(--c-focus-outline-offset);
  }
`;
