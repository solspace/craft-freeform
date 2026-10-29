import { FormErrorList } from "@components/form-controls/error-list";
import type { ControlType } from "@components/form-controls/types";
import type { Property } from "@ff-client/types/properties";
import { useId, useState } from "react";
import styled from "styled-components";

const Panel = styled.div`
  width: 100%;
  border: 1px solid var(--gray-200, #cdd8e4);
  border-radius: 8px;
  background: var(--white, #fff);
`;

const Header = styled.button`
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr);
  align-items: center;
  gap: 2px 8px;
  width: 100%;
  padding: 14px 16px;
  border: 0;
  border-radius: 7px;
  background: var(--gray-050, #f3f7fc);
  color: var(--gray-600, #515f6c);
  text-align: start;
  font: inherit;
  font-weight: 600;
  line-height: 18px;
  cursor: pointer;

  &[aria-expanded='true'] { border-bottom-left-radius: 0; border-bottom-right-radius: 0; }
  &:focus-visible { outline: 2px solid #3476b8; outline-offset: 3px; }
  &:disabled { opacity: .55; cursor: default; }
  svg { display: block; width: 16px; height: 16px; transition: transform 200ms ease; }
  &[aria-expanded='true'] svg { transform: rotate(90deg); }
  .disclosure-description { grid-column: 2; font-size: 12px; font-weight: 400; line-height: 16px; }
  @media (prefers-reduced-motion: reduce) { svg { transition: none; } }
`;

const Region = styled.div<{ $expanded: boolean }>`
  display: grid;
  grid-template-rows: ${({ $expanded }) => ($expanded ? "1fr" : "0fr")};
  opacity: ${({ $expanded }) => ($expanded ? 1 : 0)};
  transition: grid-template-rows 220ms ease, opacity 180ms ease;
  > div { min-height: 0; overflow: hidden; }
  .disclosure-content {
    display: flex;
    flex-direction: column;
    gap: 22px;
    padding: 18px 16px;
    border-top: 1px solid var(--gray-200, #cdd8e4);
  }
  @media (prefers-reduced-motion: reduce) { transition: none; }
`;

function readPreference(key?: string): boolean | undefined {
  if (!key || typeof window === "undefined") return undefined;
  try {
    const stored = window.localStorage.getItem(key);
    return stored === "true" ? true : stored === "false" ? false : undefined;
  } catch {
    return undefined;
  }
}

/** A disclosure panel that keeps nested controls mounted while it animates. */
export function DisclosureControl({
  property,
  value,
  updateValue,
  errors,
  children,
  context,
}: ControlType<Property>) {
  const id = useId();
  const storageKey = (context as { disclosureStorageKey?: string } | undefined)
    ?.disclosureStorageKey;
  const [preference, setPreference] = useState(() => ({
    key: storageKey,
    expanded: readPreference(storageKey),
  }));
  const remembered =
    preference.key === storageKey
      ? preference.expanded
      : readPreference(storageKey);
  const expanded = (storageKey ? remembered : undefined) ?? Boolean(value);
  const toggle = () => {
    const next = !expanded;
    setPreference({ key: storageKey, expanded: next });
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, String(next));
      } catch {
        /* Keep the panel usable when browser storage is unavailable. */
      }
    }
    updateValue(next);
  };
  const disabled =
    property.disabled ||
    property.flags?.includes("readonly") ||
    property.flags?.includes("as-readonly-in-instance");
  return (
    <Panel>
      <Header
        type="button"
        aria-expanded={expanded}
        aria-controls={`${id}-content`}
        aria-labelledby={`${id}-title`}
        aria-describedby={
          property.instructions ? `${id}-description` : undefined
        }
        disabled={disabled}
        onClick={toggle}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 4 4 4-4 4" />
        </svg>
        <span id={`${id}-title`}>{property.label}</span>
        {property.instructions && (
          <span className="disclosure-description" id={`${id}-description`}>
            {property.instructions}
          </span>
        )}
      </Header>
      <Region
        id={`${id}-content`}
        role="region"
        aria-labelledby={`${id}-title`}
        aria-hidden={!expanded}
        inert={!expanded}
        $expanded={expanded}
      >
        <div>
          <div className="disclosure-content">{children}</div>
        </div>
      </Region>
      <FormErrorList errors={errors} />
    </Panel>
  );
}
