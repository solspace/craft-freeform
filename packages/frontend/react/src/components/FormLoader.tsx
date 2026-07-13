"use client";

import type { CSSProperties } from "react";

export type FormLoaderProps = {
  message?: string;
  className?: string;
  variant?: "spinner" | "skeleton";
};

const keyframes = `
@keyframes ff-loader-spin {
  to { transform: rotate(360deg); }
}
@keyframes ff-loader-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
`;

const pulseStyle: CSSProperties = {
  animation: "ff-loader-pulse 1.4s ease-in-out infinite",
  backgroundColor: "currentColor",
  opacity: 0.12,
  borderRadius: "8px",
};

export function FormLoader({
  message = "Loading form…",
  className = "ff-loader",
  variant = "skeleton",
}: FormLoaderProps) {
  return (
    <div
      className={className}
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-variant={variant}
      style={rootStyle}
    >
      <style>{keyframes}</style>

      {variant === "skeleton" ? (
        <div style={skeletonRootStyle} aria-hidden="true">
          <div
            style={{
              ...pulseStyle,
              height: "0.75rem",
              width: "38%",
              marginBottom: "1.25rem",
            }}
          />
          {[0, 1, 2].map((index) => (
            <div key={index} style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  ...pulseStyle,
                  height: "0.65rem",
                  width: "28%",
                  marginBottom: "0.45rem",
                  animationDelay: `${index * 0.12}s`,
                }}
              />
              <div
                style={{
                  ...pulseStyle,
                  height: "2.5rem",
                  width: index === 2 ? "62%" : "100%",
                  animationDelay: `${index * 0.12}s`,
                }}
              />
            </div>
          ))}
          <div
            style={{
              ...pulseStyle,
              height: "2.5rem",
              width: "7rem",
              marginTop: "0.5rem",
              animationDelay: "0.36s",
            }}
          />
        </div>
      ) : (
        <div style={spinnerStyle} aria-hidden="true" />
      )}

      <p style={messageStyle}>{message}</p>
    </div>
  );
}

const rootStyle: CSSProperties = {
  display: "grid",
  gap: "1rem",
  padding: "1.25rem 0",
  color: "inherit",
};

const skeletonRootStyle: CSSProperties = {
  width: "100%",
};

const messageStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.9rem",
  opacity: 0.75,
};

const spinnerStyle: CSSProperties = {
  width: "2rem",
  height: "2rem",
  border: "3px solid currentColor",
  borderTopColor: "transparent",
  borderRadius: "50%",
  opacity: 0.85,
  animation: "ff-loader-spin 0.7s linear infinite",
};
