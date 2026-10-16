type Props = {
  device: "desktop" | "laptop" | "tablet" | "tablet-landscape" | "mobile";
};

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
    ) : device === "laptop" ? (
      <>
        <rect x="4" y="4" width="16" height="12" rx="1.5" />
        <path d="M4 16l-2 4h20l-2-4M9 20h6" />
      </>
    ) : device === "tablet-landscape" ? (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M18.5 11v2" />
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
