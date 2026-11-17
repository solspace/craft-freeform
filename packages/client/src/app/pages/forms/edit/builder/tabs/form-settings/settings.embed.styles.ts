import { editorButton, sectionHeading } from "@ff-client/styles/craft6";
import styled from "styled-components";

export const EmbedContent = styled.div`
  max-width: 64rem;
  container: freeform-embed / inline-size;
  color: var(--c-text-default);
`;

export const EmbedSetting = styled.div`
  margin-bottom: var(--c-spacing-lg);
`;

export const Description = styled.p`
  max-width: 72ch;
  margin: 0 0 var(--c-spacing-lg);
  color: var(--c-text-quiet);
  line-height: var(--c-leading-relaxed, 1.6);
`;

export const CodeLabel = styled.h2`
  ${sectionHeading};
  margin: 0 0 var(--c-spacing-sm);
  font-size: var(--c-text-md);
`;

export const CodeBlock = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--c-spacing-lg);
  padding: var(--c-spacing-md);
  border: 1px solid var(--c-color-neutral-border-quiet);
  border-radius: var(--c-radius-md);
  background: var(--c-input-fill);

  code {
    min-width: 0;
    padding-inline: var(--c-spacing-sm);
    font-family: var(--c-font-mono);
    font-size: var(--c-text-sm);
    line-height: 1.65;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    user-select: text;
  }

  button {
    ${editorButton};
    white-space: nowrap;
    > i { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; }
  }

  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
    button { justify-self: start; }
  }
`;

export const CopyFeedback = styled.div`
  min-height: 1.5em;
  margin-top: var(--c-spacing-xs);
  color: var(--c-text-quiet);
  font-size: var(--c-text-sm);
`;

export const HelpSection = styled.section`
  margin-block-start: var(--c-spacing-xl);

  h2 {
    ${sectionHeading};
    margin: 0 0 var(--c-spacing-md);
  }

  dl {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--c-spacing-md);
    margin: 0;
  }

  @container freeform-embed (max-width: 40rem) {
    dl { grid-template-columns: minmax(0, 1fr); }
  }

  > p { margin-block-end: var(--c-spacing-sm); }
  a:focus-visible {
    outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
    outline-offset: var(--c-focus-outline-offset);
    border-radius: var(--c-radius-sm);
  }
`;

export const HelpTopic = styled.div`
  min-width: 0;
  padding: var(--c-spacing-lg);
  border: 1px solid var(--c-color-neutral-border-quiet);
  border-radius: var(--c-radius-md);
  background: var(--c-surface-default);

  dt {
    margin: 0 0 var(--c-spacing-sm);
    font-weight: 600;
    color: var(--c-text-default);
  }

  dd {
    margin: 0;
    color: var(--c-text-quiet);
    line-height: var(--c-leading-relaxed, 1.6);
  }

  a {
    display: block;
    width: fit-content;
    margin-block-start: var(--c-spacing-sm);
    color: var(--c-text-link, LinkText);
    font-weight: 500;
    text-underline-offset: 3px;
  }
`;

export const DocsLink = styled.a`
  display: block;
  margin-block-start: var(--c-spacing-lg);
`;
