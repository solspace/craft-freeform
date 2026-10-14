type Props = { device: "desktop" | "tablet" | "mobile" };

export const ViewportIcon = ({ device }: Props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {device === "desktop" ? (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </>
    ) : (
      <>
        <rect
          x={device === "tablet" ? 5 : 7}
          y="2"
          width={device === "tablet" ? 14 : 10}
          height="20"
          rx="2"
        />
        <path d="M11 18.5h2" />
      </>
    )}
  </svg>
);
