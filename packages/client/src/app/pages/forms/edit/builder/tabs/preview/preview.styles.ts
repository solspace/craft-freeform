import { CurrentValue } from "@components/elements/custom-dropdown/dropdown.styles";
import { Sidebar } from "@components/layout/sidebar/sidebar";
import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const PreviewWrapper = styled.div`
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #fff;
`;

export const PreviewSidebar = styled(Sidebar)`
  h2 { margin: 0 0 ${spacings.md}; }
  p { font-size: 13px; line-height: 1.5; }
  details { margin-top: ${spacings.lg}; }
  summary { cursor: pointer; font-weight: 600; }
`;

export const Toolbar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
  margin: 20px 0;
  > label { display: flex; flex-direction: column; gap: 6px; font-weight: 600; }
  > label > div { font-weight: 400; }
  > label > p { margin: 0; font-weight: 400; }
  ${CurrentValue} { align-items: center; }
`;

export const FrameArea = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  justify-content: center;
  overflow: hidden;
  padding: ${spacings.lg};
  background: #fff;
`;

export const Frame = styled.iframe`
  display: block;
  box-sizing: content-box;
  flex-shrink: 0;
  height: 100%;
  min-height: 0;
  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.lg};
  background: white;
  box-shadow: 0 2px 8px rgb(154 165 177 / 12%);
`;
