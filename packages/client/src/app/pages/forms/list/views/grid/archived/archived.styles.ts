import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Wrapper = styled.section`
  flex: 1 1 440px;
  min-width: 0;
  border: 1px solid ${colors.hairline};
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
  container: archived-forms / inline-size;
  h2 { margin: 0; padding: 0; }
`;

export const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  border: 0;
  background: var(--gray-050, #f3f7fc);
  color: var(--gray-700, #435566);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;

  > svg { flex: none; width: 18px; height: 18px; color: #758697; }
  .archive-chevron { margin-left: auto; transition: transform .15s ease; }
  &[aria-expanded="true"] .archive-chevron { transform: rotate(90deg); }
  &:hover { background: var(--gray-100, #e4edf6); }
  &:focus-visible { outline: 2px solid var(--link-color, #1f5fea); outline-offset: -2px; }
`;

export const Count = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  padding: 0 7px;
  border-radius: 12px;
  background: #e1e7ef;
  color: #5b6c7e;
  font-size: 12px;
  line-height: 22px;
`;

export const ArchivedItems = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid ${colors.hairline};
`;
