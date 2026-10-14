import { scrollBar } from "@ff-client/styles/mixins";
import styled from "styled-components";

export const PreviewSurface = styled.div`
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--gray-200, #cdd8e4);
  border-radius: var(--radius-lg, 5px);
  background: var(--white, #fff);
  cursor: pointer;
  transition: border-color 0.15s ease-out;

  &:hover { border-color: var(--gray-300, #a6b4c9); }
  &:focus-visible {
    outline: 2px solid var(--blue-500, #0d99f2);
    outline-offset: 2px;
  }

  input, select, textarea, a { pointer-events: none; }
`;

export const PreviewContent = styled.div`
  min-height: 48px;
  max-height: 180px;
  min-width: 0;
  overflow: auto;
  overflow-wrap: anywhere;
  ${scrollBar};
`;

export const PreviewEmpty = styled.div`
  display: flex;
  align-items: center;
  min-height: 48px;
  color: var(--gray-500, #606d7b);
  font-size: 12px;
  font-weight: normal;
  font-style: italic;
  line-height: 1.5;
`;

export const PreviewCue = styled.div`
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--border-hairline, rgba(51, 64, 77, .1));
  color: var(--blue-600, #0d78b7);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
`;
