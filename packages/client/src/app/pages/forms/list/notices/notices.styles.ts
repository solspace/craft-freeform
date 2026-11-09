import { borderRadius, spacings } from "@ff-client/styles/variables";
import styled, { css } from "styled-components";

export const NoticesList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;

  margin-bottom: ${spacings.lg};
`;

export const Icon = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  min-height: 22px;
  font-size: 22px;
`;

export const Message = styled.p`
  flex: 1;

  margin: 0;
  padding: 0;
`;

export const CloseButton = styled.button`
  align-self: center;
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

const map = [
  { type: "new", accent: "#038052", bg: "transparent" },
  { type: "info", accent: "#007bff", bg: "transparent" },
  { type: "warning", accent: "#e87b00", bg: "transparent" },
  { type: "critical", accent: "#cf1324", bg: "#fbe4e4" },
  { type: "error", accent: "#cf1324", bg: "transparent" },
  { type: "log-list", accent: "#cf1324", bg: "transparent" },
];

let accentStyle = "";
map.forEach(({ type, accent, bg }) => {
  accentStyle += `
    &[data-type='${type}'] {
      fill: ${accent};
      color: ${accent};
      border-color: ${accent};
      background-color: ${bg};

      a {
        color: ${accent};
        text-decoration: underline;
        font-weight: bold;
      }
    }
  `;
});

const accentCss = css`
  ${accentStyle}
`;

export const NoticeItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;

  padding: ${spacings.sm} ${spacings.md};

  border: 1px solid #ccc;
  border-radius: ${borderRadius.lg};

  ${accentCss};

  &[data-type='error'] {
    background-color: #ffe3e4;
  }
`;
