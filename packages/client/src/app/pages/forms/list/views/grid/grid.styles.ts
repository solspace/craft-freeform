import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.lg};
`;

export const CardWrapper = styled.div<{ $dragging?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${spacings.lg};

  ${({ $dragging }) =>
    $dragging &&
    `
    [data-form-group] { outline: 1px dashed #a6c8ee; outline-offset: 8px; background: light-dark(#f6faff, var(--bg-selection-light, #f6faff)); }
    iframe { pointer-events: none; }
  `}
`;

export const Cards = styled.ul<{ $empty?: string }>`
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  grid-auto-rows: 164px;
  grid-auto-flow: row;
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: var(--large-border-radius, 5px);
  transition: background-color 180ms ease, outline-color 180ms ease;

  &:empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 80px;
    border: 1px dashed light-dark(#cbd5df, var(--hairline-color, #cbd5df));
    color: light-dark(#7b8794, var(--light-text-color, #7b8794));
    font-size: 13px;
    &::after { content: "${({ $empty }) => $empty}"; pointer-events: none; }
  }

  ${CardWrapper}[aria-busy='true'] & .handle { pointer-events: none; }
  ${CardWrapper} & .card-drop-placeholder {
    opacity: 0.18;
    border: 2px dashed var(--link-color, #0d78f2);
    background: light-dark(#eaf3ff, var(--bg-selection-light, #eaf3ff));
  }
  ${CardWrapper} & .card-chosen { box-shadow: 0 8px 24px #1f34452b; }
  ${CardWrapper} & .card-moving { opacity: 0.95; }

  gap: ${spacings.lg};
`;

export const GroupWrap = styled.div`
  container: form-card-grid / inline-size;
  & + & {
    border-top: 1px solid light-dark(#e7edf3, var(--hairline-color, #e7edf3));
    padding-top: 20px;
  }
`;

export const GroupTitle = styled.h2`
  margin: 0 0 16px;
  color: light-dark(#596673, var(--light-text-color, #596673));
  font-size: 14px;
  font-weight: 600;
`;

export const ArchivedAndGroupWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacings.lg};
  align-items: baseline;
  justify-content: space-between;

  .edit-groups {
    justify-content: flex-end;
    margin-left: auto;
  }
`;

export const GroupsButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacings.sm};
  white-space: nowrap;
  flex-shrink: 0;

  svg { display: block; flex-shrink: 0; }
  svg path:last-of-type { stroke: currentColor; }
`;

export const ContentContainer = styled.div`
  width: 100%;
  max-width: 100%;
`;

export const LoadingWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacings.lg};
`;
