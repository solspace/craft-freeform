import { editorButton } from "@ff-client/styles/craft6";
import { colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Wrapper = styled.div``;

export const LabelWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  line-height: 22px;
`;

export const Label = styled.span`
  padding-left: ${spacings.md};
  font-weight: 700;
  font-size: 11px;
  color: ${colors.gray550};
  text-transform: uppercase;
`;

export const Button = styled.button`
  ${editorButton}
  height: 22px;
  min-height: 22px;
  padding: 0 6px;
  border: 1px dashed var(--c-form-control-border-color);
  background: var(--c-surface-default);
  font-size: 12px;
  line-height: 1.25;
`;

export const NotificationItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};
  padding: ${spacings.xs} 0;
`;

export const NotificationItemEmpty = styled.div`
  padding: 2px;
  margin-left: 12px;

  font-style: italic;
  font-size: 12px;

  color: light-dark(${colors.gray300}, ${colors.muted});
`;
