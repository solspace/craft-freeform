import "../../../../../../styles/src/cp/choice-cards/choice-cards.css";
import { RecommendedBadge } from "@components/elements/badges/recommended-badge";
import { type ReactNode, useId } from "react";

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
    <div
      className="ff-choice-cards"
      data-choice-count={options.length}
      role="radiogroup"
      aria-label={label}
    >
      {options.map((option, index) => (
        <label className="ff-choice-card" key={option.value}>
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
        </label>
      ))}
    </div>
  );
}
