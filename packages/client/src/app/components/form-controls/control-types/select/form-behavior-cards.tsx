import { ChoiceCards } from "@components/elements/choice-cards/choice-cards";
import translate from "@ff-client/utils/translations";
import type { ReactNode } from "react";
import styled from "styled-components";
import type { Choice } from "./choice-buttons";

const icons: Record<string, ReactNode> = {
  reload: (
    <>
      <path d="M3 10a9 9 0 1 1 2 9M3 3v7h7" />
    </>
  ),
  "load-success-template": (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M7 13h10M7 16h6" />
    </>
  ),
  "redirect-return-url": <path d="M4 12h16m-6-6 6 6-6 6" />,
  "redirect-entry": (
    <>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Zm0 0v6h6M8 13h8M8 17h5" />
    </>
  ),
  no_limit: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 7.5-2" />
    </>
  ),
  no_limit_logged_in_users_only: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  limit_once_per_logged_in_user_only: (
    <>
      <circle cx="12" cy="7" r="4" />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
    </>
  ),
  limit_once_per_email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  limit_once_per_user_or_cookie: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path
        d="M8 8h.01M16 8h.01M12 13h.01M8 16h.01M17 15h.01"
        strokeWidth="3"
      />
    </>
  ),
  limit_once_per_user_or_ip_or_cookie: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </>
  ),
};

const details: Record<string, { label: string; instructions: string }> = {
  reload: {
    label: "Reload form",
    instructions:
      "Show a success banner and reset the form for another submission.",
  },
  "load-success-template": {
    label: "Success template",
    instructions:
      "Replace the form with the selected success template after submission.",
  },
  "redirect-return-url": {
    label: "Redirect to URL",
    instructions:
      "Send the visitor to the return URL after a successful submission.",
  },
  "redirect-entry": {
    label: "Redirect to entry",
    instructions:
      "Send the visitor to the selected Craft entry after submission.",
  },
  no_limit: {
    label: "No restrictions",
    instructions: "Allow anyone to submit as often as they like.",
  },
  no_limit_logged_in_users_only: {
    label: "Login required",
    instructions: "Require a login, with no limit on repeat submissions.",
  },
  limit_once_per_logged_in_user_only: {
    label: "Once per user",
    instructions: "Require a login and allow one submission per user.",
  },
  limit_once_per_email: {
    label: "Once per email",
    instructions: "Allow one submission per email address.",
  },
  limit_once_per_user_or_cookie: {
    label: "User or cookie",
    instructions:
      "Check the user account or browser cookie for repeat submissions.",
  },
  limit_once_per_user_or_ip_or_cookie: {
    label: "User, IP, or cookie",
    instructions:
      "Check the user account, IP address, or browser cookie for repeat submissions.",
  },
};

export function FormBehaviorCards({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: unknown;
  options: Choice[];
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <CardLayout data-choice-count={options.length}>
      <ChoiceCards
        label={label}
        value={typeof value === "string" ? value : ""}
        disabled={disabled}
        onChange={onChange}
        options={options.map((option) => ({
          ...option,
          label: details[option.value]
            ? translate(details[option.value].label)
            : option.label,
          instructions: details[option.value]
            ? translate(details[option.value].instructions)
            : undefined,
          icon: icons[option.value] ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {icons[option.value]}
            </svg>
          ) : undefined,
        }))}
      />
    </CardLayout>
  );
}

const CardLayout = styled.div`
  container-type: inline-size;
  width: 100%;
  max-width: 1100px;

  .ff-choice-cards { display: grid; grid-template-columns: minmax(0, 1fr); }
  .ff-choice-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 16px;
    grid-template-rows: auto 1fr;
    align-content: start;
    column-gap: 12px;
    row-gap: 8px;
    width: auto;
    max-width: none;
  }
  .ff-choice-card input {
    position: static;
    grid-column: 2;
    grid-row: 1;
    align-self: center;
  }
  .choice-heading {
    grid-column: 1;
    grid-row: 1;
    flex-wrap: nowrap;
    min-height: 28px;
    padding-inline-end: 0;
  }
  .choice-heading > span:last-child { min-width: 0; }
  .choice-icon { width: 28px; height: 28px; flex: 0 0 28px; border-radius: 6px; background: var(--gray-050, #f3f6fa); }
  .choice-icon svg { width: 18px; height: 18px; }
  .ff-choice-card > span:last-child { grid-column: 1 / -1; grid-row: 2; }
  .choice-detail-heading:empty { display: none; }
  .choice-instructions { margin-top: 0; }

  @container (min-width: 540px) {
    .ff-choice-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @container (min-width: 850px) {
    .ff-choice-cards { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    &[data-choice-count="4"] .ff-choice-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @container (min-width: 1050px) {
    &[data-choice-count="4"] .ff-choice-cards { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }
`;
