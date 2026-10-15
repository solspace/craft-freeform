import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Item = styled.li`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(110px, auto) auto;
  align-items: center;
  gap: 16px 24px;
  padding: 14px 16px;
  margin: 0;
  line-height: 1.5;
  list-style: none;

  & + & { border-top: 1px solid ${colors.hairline}; }
  &:hover { background: #fbfcfe; }
  &.disabled { opacity: .6; }

  @container archived-forms (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 6px 12px;
  }
`;

export const ItemIdentity = styled.div`
  min-width: 0;
  @container archived-forms (max-width: 640px) { grid-column: 1 / -1; }
`;

export const ItemTitle = styled.span`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-800, #33404d);
`;

export const ItemTitleLink = styled.button`
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0;
  border: 0;
  background: none;
  color: var(--link-color, #1f5fea);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;

  &:hover { text-decoration: underline; }
  &:focus-visible { outline: 2px solid var(--link-color, #1f5fea); outline-offset: 2px; }
`;

export const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-top: 3px;
  font-size: 12px;
  color: #7b8793;

  code {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    padding: 0;
    background: none;
    color: inherit;
    font-size: 11px;
  }
  a { color: inherit; }
  a:hover { color: var(--link-color, #1f5fea); }
`;

export const ItemDate = styled.div`
  color: #697986;
  font-size: 12px;

  > span { display: block; font-size: 11px; color: #8a96a2; }
  @container archived-forms (max-width: 640px) {
    grid-column: 1;
    grid-row: 2;
    > span { display: inline; margin-right: 5px; }
  }
`;

export const ItemActions = styled.div`
  grid-column: 3;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;

  .btn { min-width: 78px; font-size: 12px; }
  button:disabled { cursor: default; }
  @container archived-forms (max-width: 640px) {
    grid-column: 2;
    grid-row: 2;
  }
`;

export const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 6px;
  border: 0;
  border-radius: 4px;
  background: none;
  color: #8493a1;
  cursor: pointer;

  svg { width: 18px; height: 18px; }
  &:hover:not(:disabled) { color: #b91c1c; background: #fff1f2; }
  &:focus-visible { outline: 2px solid #b91c1c; outline-offset: 1px; }
`;
