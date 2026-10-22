import config from "@config/freeform/freeform.config";
import DOMPurify from "dompurify";
import { useMemo } from "react";
import styled from "styled-components";

export const FormIcon = ({
  svg,
  color,
  compact = false,
}: {
  svg?: string | null;
  color?: string;
  compact?: boolean;
}) => {
  const markup = useMemo(
    () => ({
      __html: svg
        ? DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true } })
        : "",
    }),
    [svg],
  );
  if (!config.metadata.craft?.is5 || !markup.__html) return null;
  return (
    <Icon
      $compact={compact}
      aria-hidden="true"
      style={{ color }}
      dangerouslySetInnerHTML={markup}
    />
  );
};

const Icon = styled.span<{ $compact: boolean }>`
  display: inline-grid;
  place-items: center;
  box-sizing: border-box;
  flex: 0 0 ${({ $compact }) => ($compact ? "24px" : "34px")};
  width: ${({ $compact }) => ($compact ? "24px" : "34px")};
  height: ${({ $compact }) => ($compact ? "24px" : "34px")};
  border-radius: ${({ $compact }) => ($compact ? "6px" : "8px")};
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  background: color-mix(in srgb, currentColor 9%, transparent);
  color: inherit;
  user-select: none;
  svg {
    display: block;
    width: ${({ $compact }) => ($compact ? "14px" : "18px")};
    height: ${({ $compact }) => ($compact ? "14px" : "18px")};
    fill: currentColor;
  }
`;
