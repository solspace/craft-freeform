import { borderRadius, colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Catalogs = styled.div`
  display: grid;
  gap: 8px;
  margin: 16px 0;
`;
export const CatalogButton = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  min-height: 34px;
  padding: 6px 9px;
  border: 1px solid ${colors.gray100};
  border-radius: ${borderRadius.sm};
  background: ${colors.white};
  color: ${colors.gray700};
  text-align: left;
  cursor: pointer;
  > span { flex: 1; }
  svg { width: 16px; height: 16px; flex: 0 0 16px; }
  &:hover, &[aria-expanded="true"] { background: ${colors.gray050}; border-color: ${colors.gray300}; }
`;
export const CatalogMenu = styled.div<{ $wide?: boolean }>`
  z-index: 1005;
  width: ${({ $wide }) => ($wide ? "440px" : "270px")};
  max-width: calc(100vw - 24px);
  max-height: calc(100vh - 24px);
  overflow-y: auto;
  padding: 12px;
  border: 1px solid ${colors.gray100};
  border-radius: ${borderRadius.md};
  background: ${colors.white};
  box-shadow: 0 8px 28px rgb(32 51 72 / 16%);
  h3 { display: flex; align-items: center; justify-content: space-between; margin: 0 0 10px; }
  h3 button { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border: 0; background: transparent; cursor: pointer; }
  h3 svg { width: 13px; height: 13px; }
  p { margin: 10px 0 0; color: ${colors.gray500}; font-size: 11px; }
`;
export const CatalogOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
  > div > div { min-height: 52px; height: auto; padding: 9px; }
`;
export const InlineChooser = styled.div`
  padding: 12px;
  h3 { margin: 0 0 10px; font-size: 13px; }
`;
