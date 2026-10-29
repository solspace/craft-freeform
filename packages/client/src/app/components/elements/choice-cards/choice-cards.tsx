import { RecommendedBadge } from "@components/elements/badges/recommended-badge";
import { type ReactNode, useId } from "react";
import styled from "styled-components";

export type ChoiceCardOption = {
  value: string;
  label: string;
  descriptor?: string;
  instructions?: string;
  icon?: ReactNode;
  recommended?: boolean;
};

type Props = {
  label: string;
  value?: string | null;
  options: ChoiceCardOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
};

const Group = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 10px;
  width: 100%;
`;

const Card = styled.label`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 0 1 260px;
  width: 260px;
  max-width: 100%;
  box-sizing: border-box;
  padding: 14px;
  border: 1px solid var(--gray-200, #cdd8e4);
  border-radius: 8px;
  background: var(--white, #fff);
  color: var(--gray-800, #33404d);
  cursor: pointer;

  &:has(input:checked) {
    border-color: #3476b8;
    background: #edf5fd;
    box-shadow: inset 0 0 0 1px #3476b8;
    .choice-heading { color: #235b91; }
    .choice-icon { color: #3476b8; }
  }
  &:hover:not(:has(input:disabled)) { border-color: #3476b8; }
  &:has(input:focus-visible) { outline: 2px solid #3476b8; outline-offset: 3px; }
  &:has(input:disabled) { opacity: .55; cursor: default; }
  input {
    position: absolute;
    inset-block-start: 16px;
    inset-inline-end: 14px;
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: #3476b8;
  }
  .choice-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-height: 20px;
    padding-inline-end: 24px;
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
  }
  .choice-icon { display: grid; place-items: center; flex: 0 0 20px; color: #617488; }
  .choice-icon svg { display: block; width: 20px; height: 20px; }
  .choice-detail-heading { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
  .choice-descriptor { display: block; font-size: 12px; font-weight: 600; line-height: 18px; }
  .choice-instructions { display: block; margin-top: 4px; color: var(--gray-600, #515f6c); font-size: 12px; line-height: 18px; }
`;

/** Compact settings choices with native radio behavior and room for guidance. */
export function ChoiceCards({
  label,
  value,
  options,
  disabled,
  onChange,
}: Props) {
  const id = useId();
  return (
    <Group role="radiogroup" aria-label={label}>
      {options.map((option, index) => (
        <Card key={option.value}>
          <input
            type="radio"
            name={id}
            value={option.value}
            checked={value === option.value}
            disabled={disabled}
            aria-labelledby={`${id}-${index}-title`}
            aria-describedby={`${id}-${index}-help`}
            onChange={() => onChange(option.value)}
          />
          <span className="choice-heading">
            {option.icon && (
              <span className="choice-icon" aria-hidden="true">
                {option.icon}
              </span>
            )}
            <span id={`${id}-${index}-title`}>{option.label}</span>
          </span>
          <span id={`${id}-${index}-help`}>
            <span className="choice-detail-heading">
              {option.descriptor && (
                <span className="choice-descriptor">{option.descriptor}</span>
              )}
              {option.recommended && <RecommendedBadge />}
            </span>
            {option.instructions && (
              <span className="choice-instructions">{option.instructions}</span>
            )}
          </span>
        </Card>
      ))}
    </Group>
  );
}
