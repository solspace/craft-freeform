import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const AlertsList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;

  margin-bottom: ${spacings.lg};
`;

// Shared with the server-rendered Activity Log banner.
export const LogNotice = styled.li.attrs({
  className: "ff-status-theme ff-status-surface ff-log-alert",
})``;
export const LogIcon = styled.span.attrs({ className: "ff-log-alert__icon" })``;
export const LogContent = styled.div.attrs({
  className: "ff-log-alert__content",
})``;
export const LogSummary = styled.p.attrs({
  className: "ff-log-alert__summary",
})``;
export const LogLink = styled.a.attrs({ className: "ff-log-alert__link" })``;
export const LogPeriod = styled.span.attrs({
  className: "ff-log-alert__period",
})``;
