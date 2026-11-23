import type { FormCardDays } from "@ff-client/types/forms";
import translate from "@ff-client/utils/translations";
import styled from "styled-components";
import { useCardFieldSummary } from "./card.queries";
import { Activity } from "./card.styles";

const Summary = styled(Activity)`
  &:not(.compact-details) {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    > h3 { flex-shrink: 0; }
  }
`;

const Breakdown = styled.div`
  display: grid;
  flex: 1;
  min-height: 0;
  grid-template-columns: minmax(0, 28%) minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  .field-chart { display: grid; place-items: center; min-width: 0; min-height: 0; height: 100%; }
  svg { display: block; width: 100%; height: 100%; max-width: 140px; max-height: 140px; }
  .field-options { min-width: 0; min-height: 0; max-height: 100%; overflow-y: auto; overscroll-behavior: contain; }
  .field-options:focus-visible { outline: 2px solid var(--focus-ring-color, #0094d5); outline-offset: -2px; border-radius: 3px; }
  li { flex-wrap: nowrap; }
  li > span:last-child { flex-shrink: 0; white-space: nowrap; }
  .field-key { flex: 0 0 8px; width: 8px; height: 8px; border-radius: 50%; align-self: center; }
`;
const optionColors = ["#4f7ff0", "#1db1a4", "#8b61e9", "#9aa5b1"];
const chartCenter = 60;
const chartRadius = 44;

const arcPoint = (count: number, total: number) => {
  const angle = ((count % total) / total) * 2 * Math.PI;
  return `${chartCenter + chartRadius * Math.sin(angle)} ${chartCenter - chartRadius * Math.cos(angle)}`;
};

const slicePath = (start: number, end: number, total: number) => {
  const arc = `A ${chartRadius} ${chartRadius} 0`;
  const from = arcPoint(start, total);
  // SVG skips an arc whose endpoints coincide, so use two arcs for a full ring.
  if (end - start === total) {
    const halfway = `${chartCenter} ${chartCenter + chartRadius}`;
    return `M ${from} ${arc} 0 1 ${halfway} ${arc} 0 1 ${from}`;
  }

  const largeArc = end - start > total / 2 ? 1 : 0;
  return `M ${from} ${arc} ${largeArc} 1 ${arcPoint(end, total)}`;
};

export const CardFieldSummary = ({
  id,
  fieldId,
  days,
  compact,
}: {
  id: number;
  fieldId?: number | null;
  days: FormCardDays;
  compact: boolean;
}) => {
  const { data, isPending, isError, refetch, isFetching } = useCardFieldSummary(
    id,
    fieldId,
    days,
  );
  const options = data?.options.slice(0, 3) ?? [];
  const remainder =
    (data?.count ?? 0) -
    options.reduce((total, option) => total + option.count, 0);
  const slices =
    remainder > 0
      ? [
          ...options,
          {
            label: translate("Other choices"),
            count: remainder,
            percent: Math.round((remainder / (data?.count || 1)) * 1000) / 10,
          },
        ]
      : options;
  let responseOffset = 0;
  return (
    <Summary className={compact ? "compact-details" : undefined} data-no-drag>
      {!fieldId ? (
        <p>{translate("Choose a summary field in the card menu.")}</p>
      ) : isPending ? (
        <p role="status">{translate("Loading summary…")}</p>
      ) : isError ? (
        <p role="status">
          {translate("Could not load field summary.")}{" "}
          <button
            type="button"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            {translate("Try again")}
          </button>
        </p>
      ) : (
        data && (
          <>
            <h3>{data.label}</h3>
            {!data.count ? (
              <p>{translate("No responses in this period.")}</p>
            ) : data.kind === "number" ? (
              <div className="field-average">
                <strong>
                  {data.average?.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </strong>{" "}
                <span>
                  {translate("average · {count} responses", {
                    count: data.count.toLocaleString(),
                  })}
                </span>
                {!compact && (
                  <p>
                    {translate("Range: {min}–{max}", {
                      min: String(data.min),
                      max: String(data.max),
                    })}
                  </p>
                )}
              </div>
            ) : compact ? (
              <ul>
                {data.options.slice(0, 1).map((option) => (
                  <li key={option.label}>
                    <span className="field-option" title={option.label}>
                      {option.label}
                    </span>
                    <span>
                      {option.percent.toLocaleString()}% ·{" "}
                      {option.count.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Breakdown>
                <div className="field-chart">
                  <svg
                    viewBox="0 0 120 120"
                    role="img"
                    aria-label={translate("{label}: {count} responses", {
                      label: data.label,
                      count: data.count.toLocaleString(),
                    })}
                  >
                    {slices.map((option, index) => {
                      const start = responseOffset;
                      responseOffset += option.count;
                      return (
                        <path
                          key={index}
                          d={slicePath(start, responseOffset, data.count)}
                          fill="none"
                          stroke={optionColors[index]}
                          strokeWidth="18"
                        >
                          <title>
                            {option.label}: {option.percent}% ·{" "}
                            {option.count.toLocaleString()}
                          </title>
                        </path>
                      );
                    })}
                    <text
                      x="60"
                      y="59"
                      textAnchor="middle"
                      fill="currentColor"
                      fontSize="19"
                      fontWeight="600"
                    >
                      {data.count.toLocaleString()}
                    </text>
                    <text
                      x="60"
                      y="74"
                      textAnchor="middle"
                      fill="#687684"
                      fontSize="9"
                    >
                      {translate("responses")}
                    </text>
                  </svg>
                </div>
                <section
                  className="field-options"
                  aria-label={translate("{label} choices", {
                    label: data.label,
                  })}
                  // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need to scroll the independently overflowing choices.
                  tabIndex={0}
                >
                  <ul>
                    {slices.map((option, index) => (
                      <li key={index}>
                        <span
                          className="field-key"
                          style={{ backgroundColor: optionColors[index] }}
                          aria-hidden="true"
                        />
                        <span className="field-option" title={option.label}>
                          {option.label}
                        </span>
                        <span>
                          {option.percent.toLocaleString()}% ·{" "}
                          {option.count.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              </Breakdown>
            )}
          </>
        )
      )}
    </Summary>
  );
};
