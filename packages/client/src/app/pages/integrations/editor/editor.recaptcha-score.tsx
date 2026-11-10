import { RecommendedBadge } from "@components/elements/badges/recommended-badge";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import type { Property } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import { type CSSProperties, useId } from "react";
import styled from "styled-components";

const Slider = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 54px;
  align-items: center;
  gap: 9px 14px;
  width: min(100%, 760px);
  box-sizing: border-box;
  padding: 14px 16px 12px;
  border: 1px solid var(--border-hairline, #d6dfe8);
  border-radius: var(--large-border-radius, 6px);
  background: var(--gray-050, #f3f7fc);

  input.range { min-width: 0; width: 100%; height: 28px; margin: 0; padding: 0; background: transparent; }
  input.range:focus-visible { box-shadow: var(--focus-ring); border-radius: var(--medium-border-radius, 4px); }
  input.range:disabled { opacity: .55; cursor: default; }
  input.range::-webkit-slider-runnable-track { background: linear-gradient(to right, #6c879f var(--score-position), #d6dfe8 var(--score-position)); box-shadow: none; border-radius: 999px; }
  input.range::-moz-range-track { background: #d6dfe8; box-shadow: none; border-radius: 999px; }
  input.range::-moz-range-progress { height: 6px; border-radius: 999px; background: #6c879f; }
  output {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-height: 32px;
    border: 1px solid var(--border-hairline, #cdd8e4);
    border-radius: var(--medium-border-radius, 4px);
    background: var(--white, #fff);
    color: var(--ui-control-color, #515f6c);
    font-size: 13px;
    font-weight: 600;
    line-height: 20px;
  }
  .score-legend { grid-column: 1; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; color: var(--gray-600, #515f6c); font-size: 12px; line-height: 18px; }
  .score-legend > span, .score-legend-label { display: block; }
  .score-legend > span:nth-child(2) { display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center; }
  .score-legend > span:last-child { text-align: end; }
  .score-legend strong { display: block; font-weight: 600; }
  .score-legend small { display: block; margin-top: 2px; color: var(--gray-500, #606d7b); font-size: 11px; line-height: 16px; }
`;

export function RecaptchaScore({
  property,
  value,
  updateValue,
  errors,
  context,
}: ControlType<Property>) {
  const id = useId();
  const parsed = Number(value ?? 0.5);
  const score = Number.isFinite(parsed)
    ? Math.max(0, Math.min(1, parsed))
    : 0.5;
  const text = score.toFixed(1);
  const disabled =
    property.disabled ||
    property.flags?.includes("readonly") ||
    property.flags?.includes("as-readonly-in-instance");
  return (
    <Control property={property} errors={errors} context={context}>
      <Slider
        style={{ "--score-position": `${score * 100}%` } as CSSProperties}
      >
        <input
          id={id}
          type="range"
          className="range"
          min="0"
          max="1"
          step="0.1"
          value={text}
          disabled={disabled}
          aria-label={property.label ?? translate("Score Threshold")}
          aria-describedby={`${id}-legend`}
          onChange={(event) =>
            updateValue(Number(event.currentTarget.value).toFixed(1))
          }
        />
        <output htmlFor={id} aria-label={translate("Minimum accepted score")}>
          {text}
        </output>
        <div className="score-legend" id={`${id}-legend`}>
          <span>
            <strong>0.0</strong>
            <span className="score-legend-label">
              {translate("Less strict")}
            </span>
            <small>{translate("Flags fewer submissions")}</small>
          </span>
          <span>
            <strong>0.5</strong>
            <RecommendedBadge />
          </span>
          <span>
            <strong>1.0</strong>
            <span className="score-legend-label">
              {translate("More strict")}
            </span>
            <small>{translate("Flags more submissions")}</small>
          </span>
        </div>
      </Slider>
    </Control>
  );
}
