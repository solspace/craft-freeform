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
    [data-form-group] { outline: 1px dashed #a6c8ee; outline-offset: 8px; background: #f6faff; }
  `}
`;

export const Cards = styled.ul<{ $empty?: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
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
    border: 1px dashed #cbd5df;
    color: #7b8794;
    font-size: 13px;
    &::after { content: "${({ $empty }) => $empty}"; pointer-events: none; }
  }

  ${CardWrapper}[aria-busy='true'] & .handle { pointer-events: none; }
  ${CardWrapper} & .card-drop-placeholder {
    opacity: 0.18;
    border: 2px dashed var(--link-color, #0d78f2);
    background: #eaf3ff;
  }
  ${CardWrapper} & .card-chosen { box-shadow: 0 8px 24px #1f34452b; }
  ${CardWrapper} & .card-moving { opacity: 0.95; }

  gap: ${spacings.lg};
`;

export const GroupWrap = styled.div`
  & + & {
    border-top: 1px solid #e7edf3;
    padding-top: 20px;
  }
`;

export const GroupTitle = styled.h2`
  margin: 0 0 16px;
  color: var(--c-text-default);
  font-size: 18px;
  font-weight: 700;
  line-height: 28px;
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

  &:hover {
    color: var(--link-color);

    svg {
      path:last-of-type {
        stroke: var(--link-color);
      }
    }
  }
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
