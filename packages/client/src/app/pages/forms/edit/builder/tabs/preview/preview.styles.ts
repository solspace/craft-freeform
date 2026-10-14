import styled from "styled-components";

export const PreviewWrapper = styled.div`
  height: 100%;
  overflow: auto;
  background: #f1f5f9;
`;

export const Panel = styled.div`
  padding: 24px;
  details { margin-top: 24px; }
  summary { cursor: pointer; font-weight: 600; }
`;

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 16px;
  margin: 20px 0;
  label { display: flex; flex-direction: column; gap: 6px; }
`;

export const FrameArea = styled.div`
  display: flex;
  justify-content: center;
  overflow: auto;
  padding: 12px;
  background: #e2e8f0;
`;

export const Frame = styled.iframe`
  display: block;
  max-width: 100%;
  height: 680px;
  border: 0;
  background: white;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
`;
