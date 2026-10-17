export function WizardIcon({ kind }: { kind: string }) {
  const paths: Record<string, string> = {
    blank: "M5 3h9l5 5v13H5z M14 3v5h5",
    contact: "M3 5h18v14H3z M3 6l9 7 9-7",
    quote: "M6 3h12v18H6z M9 7h6 M9 11h6 M9 15h4",
    application: "M3 7h18v13H3z M8 7V4h8v3 M3 12h18 M10 12v3h4v-3",
    event: "M4 5h16v16H4z M8 3v4 M16 3v4 M4 10h16 M8 14h2 M14 14h2 M8 18h2",
    feedback:
      "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z",
    newsletter: "M4 8h16v13H4z M4 10l8 5 8-5 M7 8V3h10v5 M9 5h6",
    support:
      "M4 12v-1a8 8 0 0 1 16 0v1 M2 12h4v7H2z M18 12h4v7h-4z M18 19v2h-6",
    appointment: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l3 2",
    volunteer: "M12 20 4 12a5 5 0 0 1 8-6 5 5 0 0 1 8 6Z",
    product: "m3 7 9-4 9 4v10l-9 4-9-4Z M3 7l9 4 9-4 M12 11v10 M7.5 5l9 4",
    testimonial: "M4 4h16v12H9l-5 4Z M8 8h3v4H8z M14 8h3v4h-3z",
    other: "M12 4v16 M4 12h16",
    wizard: "M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[kind] ?? paths.other} />
    </svg>
  );
}
