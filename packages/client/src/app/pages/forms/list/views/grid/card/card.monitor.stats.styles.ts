import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

const monitorColors = {
  success: `light-dark(#78db89, ${colors.green600})`,
  failed: `light-dark(#ec6d6b, ${colors.red600})`,
  pending: `light-dark(#bcc8d9, ${colors.muted})`,
};

export const MonitorStatus = styled.span`
  display: inline-block;
  white-space: nowrap;
  align-items: center;
  border-radius: 3px;
  font-size: 11px;
  line-height: 1.2;
  font-weight: 500;
  font-family: monospace;
  color: light-dark(#424d59, ${colors.muted});
`;

export const LastTestStatus = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 3px;
  font-size: 11px;
  color: light-dark(#424d59, ${colors.muted});
  line-height: 20px;
`;

export const StatsHeader = styled.div<{ $width?: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  width: ${({ $width = "100%" }) => $width};
  max-width: 100%;
`;

export const StatsChartContainer = styled.div<{ $align?: "left" | "right" }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: ${({ $align = "left" }) =>
    $align === "right" ? "flex-end" : "flex-start"};
  text-align: ${({ $align = "left" }) => $align};
`;

export const LineIndicator = styled.div<{ $width?: string }>`
  width: ${({ $width = "100%" }) => $width};
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(
    to right,
    ${monitorColors.success} 0%,
    ${monitorColors.success} var(--success),
    ${monitorColors.failed} var(--success),
    ${monitorColors.failed} var(--failed),
    ${monitorColors.pending} var(--failed),
    ${monitorColors.pending} var(--pending),
    ${colors.gray300} var(--pending),
    ${colors.gray300} 100%
  );
`;

export const TestStatusIcon = styled.div<{
  $status: "success" | "failed" | "pending";
  $size: "sm" | "lg";
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${({ $size = "sm" }) => ($size === "sm" ? "20px" : "24px")};
  height: ${({ $size = "sm" }) => ($size === "sm" ? "20px" : "24px")};
  color: ${({ $status }) => {
    switch ($status) {
      case "success":
        return monitorColors.success;
      case "failed":
        return monitorColors.failed;
      case "pending":
        return monitorColors.pending;
      default:
        return monitorColors.pending;
    }
  }};

  svg {
    display: block;
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
`;

export const ErrorMessage = styled.div<{ $withMargin?: boolean }>`
  color: ${colors.error};
  font-size: 11px;
  line-height: 1.2;
  font-weight: 500;
  font-family: monospace;
  margin-top: ${({ $withMargin }) => ($withMargin ? "15px" : "0px")};
`;
