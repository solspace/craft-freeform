import { borderRadius, colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const ComponentSearch = styled.div`
  position: sticky;
  top: -12px;
  z-index: 1;
  padding: 0 0 12px;
  background: ${colors.white};
  input {
    width: 100%;
    height: 34px;
    box-sizing: border-box;
    padding: 6px 10px;
    border: 1px solid ${colors.gray200};
    border-radius: ${borderRadius.md};
    background: ${colors.white};
    color: ${colors.gray700};
    font: inherit;
    font-size: 12px;
    &:focus-visible { outline: 2px solid ${colors.gray500}; outline-offset: 1px; }
  }
`;

export const ComponentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  @media (max-width: 480px) { grid-template-columns: minmax(0, 1fr); }
`;
export const ComponentCard = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid ${colors.gray100};
  border-radius: ${borderRadius.md};
  background: ${colors.white};
  &:hover, &:focus-within { border-color: ${colors.gray400}; }
`;
export const AddComponent = styled.button`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${colors.gray700};
  text-align: left;
  cursor: grab;
  &:focus-visible { outline: 2px solid ${colors.gray500}; outline-offset: -2px; }
  strong { display: block; padding: 10px 10px 4px; font-size: 12px; line-height: 18px; }
  small { display: block; padding: 0 10px 10px; font-size: 11px; line-height: 16px; color: ${colors.gray500}; }
`;
export const Arrangement = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px 10px;
  font-size: 11px;
  color: ${colors.gray500};
`;
export const ComponentPreview = styled.div<{ $columns: string }>`
  display: grid;
  grid-template-columns: ${({ $columns }) => $columns};
  gap: 8px;
  align-items: center;
  width: 100%;
  height: 96px;
  flex-shrink: 0;
  box-sizing: border-box;
  padding: 14px;
  background: ${colors.gray050};
  border-radius: ${borderRadius.md} ${borderRadius.md} 0 0;
  border-bottom: 1px solid ${colors.gray100};
  > div { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .preview-heading { height: 6px; width: 78%; border-radius: 2px; background: #647d99; }
  .preview-number { width: 42%; height: 12px; background: #647d99; border-radius: 2px; }
  .preview-button { width: 48%; height: 10px; background: #647d99; border-radius: 3px; }
  .preview-symbol { display: flex; align-items: center; justify-content: center; height: 22px; font-size: 24px; line-height: 1; color: #647d99; }
  .preview-text { display: flex; flex-direction: column; gap: 3px; }
  .preview-text i { display: block; height: 3px; border-radius: 2px; background: #c6d2e0; }
  .preview-text i:last-child { width: 70%; }
  .preview-image { display: flex; align-items: center; justify-content: center; height: 48px; border-radius: 3px; background: #dbe7f1; color: #8da6bc; }
  .preview-image svg { width: 24px; height: 24px; }
  .preview-image:not(:only-child) { height: 26px; }
  .preview-image:not(:only-child) svg { width: 18px; height: 18px; }
  .preview-divider { height: 1px; background: #bccbd9; margin-top: 3px; }
  &[data-cards='true'] > div { background: #fff; border: 1px solid #dbe3ec; border-radius: 4px; padding: 7px 5px; }
  &[data-background='true'] {
    background: linear-gradient(145deg, #647d99, #334155);
    > div { align-items: center; }
    .preview-heading { background: #fff; width: 65%; }
    .preview-text { width: 85%; align-items: center; }
    .preview-text i { width: 100%; background: #d3deea; }
    .preview-text i:last-child { width: 70%; }
  }
`;
