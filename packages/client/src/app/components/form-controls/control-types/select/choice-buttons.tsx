import translate from "@ff-client/utils/translations";
import { useRef } from "react";
import styled from "styled-components";

export type Choice = { value: string; label: string };
type ChoiceKind =
  | "alignment"
  | "heading"
  | "appearance"
  | "crop"
  | "size"
  | "ratio"
  | "fit"
  | "responsive"
  | "text-size"
  | "columns"
  | "background"
  | "column-style"
  | "callout"
  | "line"
  | "thickness"
  | "corner-radius"
  | "opacity"
  | "playback";
const opacities: Record<string, number> = {
  light: 10,
  quarter: 25,
  half: 50,
  strong: 75,
};
const thicknesses: Record<string, number> = {
  none: 0,
  one: 1,
  two: 2,
  three: 3,
  five: 5,
};
const cornerRadii: Record<string, number> = {
  three: 3,
  five: 5,
  ten: 10,
  fifteen: 15,
  twenty: 20,
};
const calloutColors: Record<
  string,
  { icon: string; active: string; text: string }
> = {
  neutral: { icon: "#475569", active: "#64748b", text: "#ffffff" },
  info: { icon: "#1d4ed8", active: "#2563eb", text: "#ffffff" },
  success: { icon: "#15803d", active: "#15803d", text: "#ffffff" },
  warning: { icon: "#854d0e", active: "#facc15", text: "#713f12" },
  danger: { icon: "#b91c1c", active: "#b91c1c", text: "#ffffff" },
};
const columnDiagrams: Record<string, number[]> = {
  one: [1],
  two: [1, 1],
  three: [1, 1, 1],
  four: [1, 1, 1, 1],
  five: [1, 1, 1, 1, 1],
  six: [1, 1, 1, 1, 1, 1],
  wide: [2, 1],
  narrow: [1, 2],
  "three-one": [3, 1],
  "one-three": [1, 3],
  sidebar: [1, 2, 1],
};
const anchors: Record<string, [number, number]> = {
  "top-left": [6, 6],
  top: [12, 6],
  "top-right": [18, 6],
  left: [6, 12],
  center: [12, 12],
  right: [18, 12],
  "bottom-left": [6, 18],
  bottom: [12, 18],
  "bottom-right": [18, 18],
};
const paths: Record<string, string> = {
  left: "M4 5h16M4 10h10M4 15h16M4 20h10",
  center: "M4 5h16M7 10h10M4 15h16M7 20h10",
  right: "M4 5h16M10 10h10M4 15h16M10 20h10",
  justify: "M4 5h16M4 10h16M4 15h16M4 20h16",
  top: "M3 3h18M7 7v14M17 7v9",
  middle: "M3 12h18M7 3v18M17 7v10",
  bottom: "M3 21h18M7 3v14M17 8v9",
};
const Group = styled.div`
  display: inline-flex;
  width: fit-content;
  align-self: flex-start;
  flex: 0 0 auto;
  max-width: 100%;
  .btn {
    display: inline-flex; align-items: center; justify-content: center;
    flex: 0 1 38px; min-width: 32px; width: 38px; height: 34px; padding: 0;
    font-size: 12px; font-weight: 600;
    svg { display: block; width: 18px; height: 18px; flex: 0 0 18px; }
  }
  &[data-kind='appearance'] button { width: 56px; flex-basis: 56px; }
  &[data-kind='crop'] { display: grid; grid-template-columns: repeat(3, 34px); gap: 3px; }
  &[data-kind='crop'] .btn { width: 34px; min-width: 34px; }
  &[data-kind='size'] .btn, &[data-kind='text-size'] .btn {
    width: auto; flex: 0 1 auto; min-width: 42px; padding: 0 9px;
    flex-direction: column; gap: 2px; line-height: 1;
  }
  &[data-kind='text-size'] .btn { min-width: 32px; padding: 0 8px; }
  .choice-unit { font-size: 10px; font-weight: 400; }
  &[data-kind='ratio'] .btn { width: 48px; flex-basis: 48px; flex-direction: column; gap: 2px; line-height: 1; }
  &[data-kind='ratio'] svg { width: 16px; height: 16px; flex: 0 0 16px; }
  &[data-kind='fit'] .btn { width: auto; flex: 0 1 auto; padding: 0 10px; gap: 6px; }
  &[data-kind='responsive'] .btn { width: auto; flex: 0 1 auto; padding: 0 10px; gap: 6px; }
  &[data-kind='background'] .btn, &[data-kind='column-style'] .btn { width: auto; flex: 0 1 auto; padding: 0 10px; gap: 6px; }
  &[data-kind='columns'] {
    display: grid; width: 100%; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px;
    .btn { width: 100%; min-width: 0; height: 38px; padding: 6px; }
    svg { width: 68px; max-width: 100%; height: 20px; flex: 0 1 68px; }
  }
  &[data-kind='callout'] .btn { color: var(--callout-icon); }
  &[data-kind='callout'] .btn.active { background: var(--callout-active); color: var(--callout-active-text); }
  &[data-kind='thickness'] .btn { width: 44px; flex-basis: 44px; height: 38px; flex-direction: column; gap: 4px; line-height: 1; }
  &[data-kind='thickness'] .btn:last-child { width: 58px; flex-basis: 58px; }
  &[data-kind='thickness'] svg { width: 24px; height: 8px; flex: 0 0 8px; }
  &[data-kind='corner-radius'] .btn { width: 36px; flex-basis: 36px; height: 38px; flex-direction: column; gap: 3px; line-height: 1; }
  &[data-kind='corner-radius'] .btn:last-child { width: 58px; flex-basis: 58px; }
  &[data-kind='corner-radius'] svg { width: 20px; height: 14px; flex: 0 0 14px; }
  &[data-kind='opacity'] .btn { width: 44px; flex-basis: 44px; height: 38px; flex-direction: column; gap: 3px; line-height: 1; }
  &[data-kind='opacity'] .btn:last-child { width: 58px; flex-basis: 58px; }
  &[data-kind='opacity'] svg { width: 20px; height: 12px; flex: 0 0 12px; }
  &[data-kind='playback'] .btn { width: auto; flex: 0 1 auto; padding: 0 9px; gap: 5px; }
  .choice-pill { display: block; width: 28px; height: 14px; box-sizing: border-box; border-radius: 999px; }
  .choice-pill-filled { background: currentColor; }
  .choice-pill-outline { border: 1.5px solid currentColor; }
  .choice-text { font-size: 13px; line-height: 1; text-decoration: underline; text-underline-offset: 2px; }
`;

export const choiceButtonKind = (
  handle: string,
  options: Choice[],
): ChoiceKind | undefined => {
  if (
    handle === "cardRadiusPreset" &&
    options.length === 6 &&
    options.every(
      (option) =>
        option.value === "custom" || Object.hasOwn(cornerRadii, option.value),
    )
  )
    return "corner-radius";
  if (
    handle === "overlayOpacityPreset" &&
    options.length === 5 &&
    options.every(
      (option) =>
        option.value === "custom" || Object.hasOwn(opacities, option.value),
    )
  )
    return "opacity";
  if (
    ["playback", "playerControls", "loopPlayback"].includes(handle) &&
    options.length === 2 &&
    options.every((option) =>
      ["manual", "autoplay", "show", "hide", "once", "loop"].includes(
        option.value,
      ),
    )
  )
    return "playback";
  if (
    ["thicknessPreset", "cardBorderWidthPreset"].includes(handle) &&
    options.length === 5 &&
    options.every(
      (option) =>
        option.value === "custom" || Object.hasOwn(thicknesses, option.value),
    )
  )
    return "thickness";
  if (
    handle === "lineStyle" &&
    options.length === 3 &&
    options.every((option) =>
      ["solid", "dashed", "dotted"].includes(option.value),
    )
  )
    return "line";
  if (
    handle === "appearance" &&
    options.length === 5 &&
    options.every((option) => Object.hasOwn(calloutColors, option.value))
  )
    return "callout";
  if (
    handle === "background" &&
    options.length === 3 &&
    options.every((option) => ["none", "color", "image"].includes(option.value))
  )
    return "background";
  if (
    handle === "columnStyle" &&
    options.length === 2 &&
    options.every((option) => ["plain", "cards"].includes(option.value))
  )
    return "column-style";
  if (
    handle === "preset" &&
    options.length > 0 &&
    options.length <= Object.keys(columnDiagrams).length &&
    options.every((option) => Object.hasOwn(columnDiagrams, option.value))
  )
    return "columns";
  if (
    handle === "textSize" &&
    options.length === 6 &&
    options.every((option) =>
      ["default", "small", "medium", "large", "display", "custom"].includes(
        option.value,
      ),
    )
  )
    return "text-size";
  if (
    handle === "mobile" &&
    options.length === 2 &&
    options.every((option) => ["stack", "keep"].includes(option.value))
  )
    return "responsive";
  if (
    handle === "imageFit" &&
    options.length === 2 &&
    options.every((option) => ["cover", "contain"].includes(option.value))
  )
    return "fit";
  if (
    handle === "aspectRatio" &&
    options.length >= 2 &&
    options.length <= 5 &&
    options.every((option) =>
      ["original", "landscape", "photo", "square", "portrait"].includes(
        option.value,
      ),
    )
  )
    return "ratio";
  if (
    (/(?:size|spacing|padding|gap)$/i.test(handle) ||
      handle === "iconSizePreset") &&
    options.length >= 3 &&
    options.length <= 4 &&
    ["small", "medium", "large"].every((value) =>
      options.some((option) => option.value === value),
    ) &&
    options.every((option) =>
      ["none", "small", "medium", "large", "custom"].includes(option.value),
    )
  )
    return "size";
  if (
    handle === "cropPosition" &&
    options.length === 9 &&
    options.every((option) => Object.hasOwn(anchors, option.value))
  )
    return "crop";
  if (
    /alignment$/i.test(handle) &&
    options.length > 0 &&
    options.every((option) => Object.hasOwn(paths, option.value))
  )
    return "alignment";
  if (
    handle === "level" &&
    options.length > 0 &&
    options.every((option) => /^h[1-6]$/.test(option.value))
  )
    return "heading";
  if (
    handle === "appearance" &&
    options.length === 3 &&
    options.every((option) =>
      ["filled", "outline", "link"].includes(option.value),
    )
  )
    return "appearance";
};

export const ChoiceButtons = ({
  label,
  value,
  options,
  kind,
  disabled,
  onChange,
}: {
  label: string;
  value: unknown;
  options: Choice[];
  kind: ChoiceKind;
  disabled?: boolean;
  onChange: (value: string) => void;
}) => {
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  return (
    <Group
      className={
        kind === "crop" || kind === "columns"
          ? "btngroup--exclusive"
          : "btngroup btngroup--exclusive"
      }
      role="group"
      aria-label={translate(label)}
      data-kind={kind}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          className={`btn${value === option.value ? " active" : ""}`}
          type="button"
          style={
            kind === "callout"
              ? ({
                  "--callout-icon": calloutColors[option.value].icon,
                  "--callout-active": calloutColors[option.value].active,
                  "--callout-active-text": calloutColors[option.value].text,
                } as React.CSSProperties)
              : undefined
          }
          disabled={disabled}
          ref={(element) => {
            buttons.current[index] = element;
          }}
          aria-label={translate(option.label)}
          title={translate(option.label)}
          aria-pressed={value === option.value}
          tabIndex={selected === index ? 0 : -1}
          onClick={() => onChange(option.value)}
          onKeyDown={(event) => {
            const direction =
              event.key === "ArrowDown"
                ? kind === "crop"
                  ? 3
                  : kind === "columns"
                    ? 3
                    : 1
                : event.key === "ArrowUp"
                  ? kind === "crop"
                    ? -3
                    : kind === "columns"
                      ? -3
                      : -1
                  : event.key === "ArrowRight"
                    ? 1
                    : event.key === "ArrowLeft"
                      ? -1
                      : 0;
            if (!direction && !["Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? options.length - 1
                  : (index + direction + options.length) % options.length;
            buttons.current[next]?.focus();
            onChange(options[next].value);
          }}
        >
          {kind === "opacity" ? (
            option.value === "custom" ? (
              translate(option.label)
            ) : (
              <>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 14"
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  <rect
                    x="1"
                    y="1"
                    width="22"
                    height="12"
                    rx="2"
                    fill="currentColor"
                    fillOpacity={opacities[option.value] / 100}
                  />
                </svg>
                <span className="choice-unit">{opacities[option.value]}%</span>
              </>
            )
          ) : kind === "playback" ? (
            <>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {["show", "hide"].includes(option.value) ? (
                  <>
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    {option.value === "show" ? (
                      <path d="M5 15h14M8 13v4m8-4v4" />
                    ) : (
                      <path d="m5 18 14-12" />
                    )}
                  </>
                ) : option.value === "loop" ? (
                  <path d="M4 7h13l3 3M17 4l3 3-3 3M20 17H7l-3-3m3 6-3-3 3-3" />
                ) : (
                  <>
                    <circle cx="12" cy="12" r="9" />
                    <path d="m10 8 6 4-6 4Z" />
                    {option.value === "autoplay" && (
                      <path d="m19 2-3 4h4l-3 4" />
                    )}
                  </>
                )}
              </svg>
              <span>{translate(option.label)}</span>
            </>
          ) : kind === "corner-radius" ? (
            option.value === "custom" ? (
              translate(option.label)
            ) : (
              <>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 28 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect
                    x="2"
                    y="2"
                    width="24"
                    height="16"
                    rx={Math.min(8, cornerRadii[option.value] / 3)}
                  />
                </svg>
                <span className="choice-unit">
                  {cornerRadii[option.value]}px
                </span>
              </>
            )
          ) : kind === "thickness" ? (
            option.value === "custom" ? (
              translate(option.label)
            ) : (
              <>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={thicknesses[option.value] || 1}
                  strokeDasharray={option.value === "none" ? "2 2" : undefined}
                  opacity={option.value === "none" ? 0.4 : 1}
                >
                  <path d="M2 4h20" />
                </svg>
                <span className="choice-unit">
                  {thicknesses[option.value]}px
                </span>
              </>
            )
          ) : kind === "line" ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap={option.value === "dotted" ? "round" : "butt"}
            >
              <path
                d="M3 12h18"
                strokeDasharray={
                  option.value === "dashed"
                    ? "5 3"
                    : option.value === "dotted"
                      ? "0.1 4"
                      : undefined
                }
              />
            </svg>
          ) : kind === "callout" ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {option.value === "warning" ? (
                <>
                  <path d="M10.4 3.8 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.6 3.8a1.8 1.8 0 0 0-3.2 0Z" />
                  <path d="M12 9v4m0 4h.01" />
                </>
              ) : option.value === "danger" ? (
                <>
                  <path d="m8 2-6 6v8l6 6h8l6-6V8l-6-6Z" />
                  <path d="m9 9 6 6m0-6-6 6" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="9" />
                  {option.value === "success" ? (
                    <path d="m7.5 12 3 3 6-6" />
                  ) : option.value === "info" ? (
                    <path d="M12 11v6m0-10h.01" />
                  ) : (
                    <path d="M8 12h8" />
                  )}
                </>
              )}
            </svg>
          ) : kind === "background" || kind === "column-style" ? (
            <>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {kind === "background" ? (
                  <>
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      fill={option.value === "color" ? "currentColor" : "none"}
                      fillOpacity="0.35"
                    />
                    {option.value === "none" ? (
                      <path d="m4 20 16-16" />
                    ) : option.value === "image" ? (
                      <>
                        <circle cx="8" cy="8" r="1.5" />
                        <path d="m3 17 6-6 4 4 3-3 5 5" />
                      </>
                    ) : (
                      <path
                        d="M12 3v18H3V3z"
                        fill="currentColor"
                        stroke="none"
                      />
                    )}
                  </>
                ) : option.value === "cards" ? (
                  <>
                    <rect x="2" y="4" width="8" height="16" rx="2" />
                    <rect x="14" y="4" width="8" height="16" rx="2" />
                    <path d="M4.5 9h3M4.5 13h3M16.5 9h3M16.5 13h3" />
                  </>
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h10" />
                )}
              </svg>
              <span>{translate(option.label)}</span>
            </>
          ) : kind === "columns" ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 80 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              {columnDiagrams[option.value].map((ratio, column, ratios) => {
                const available = 74 - (ratios.length - 1) * 3;
                const total = ratios.reduce((sum, width) => sum + width, 0);
                const preceding = ratios
                  .slice(0, column)
                  .reduce((sum, width) => sum + width, 0);
                return (
                  <rect
                    key={column}
                    x={3 + (available * preceding) / total + column * 3}
                    y="3"
                    width={(available * ratio) / total}
                    height="18"
                    rx="1.5"
                    fillOpacity="0.15"
                  />
                );
              })}
            </svg>
          ) : kind === "responsive" ? (
            <>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                {option.value === "stack" ? (
                  <>
                    <rect x="5" y="3" width="14" height="7" rx="1" />
                    <rect x="5" y="14" width="14" height="7" rx="1" />
                  </>
                ) : (
                  <>
                    <rect x="3" y="5" width="7" height="14" rx="1" />
                    <rect x="14" y="5" width="7" height="14" rx="1" />
                  </>
                )}
              </svg>
              <span>{translate(option.label)}</span>
            </>
          ) : kind === "ratio" ? (
            (() => {
              const ratio = /(\d+):(\d+)/.exec(option.label);
              const numeric = ratio
                ? Number(ratio[1]) / Number(ratio[2])
                : 4 / 3;
              const width = numeric >= 1 ? 20 : 20 * numeric;
              const height = numeric >= 1 ? 20 / numeric : 20;
              return (
                <>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect
                      x={(24 - width) / 2}
                      y={(24 - height) / 2}
                      width={width}
                      height={height}
                      rx="1"
                      strokeDasharray={ratio ? undefined : "3 2"}
                    />
                  </svg>
                  <span className="choice-unit">
                    {ratio
                      ? `${ratio[1]}:${ratio[2]}`
                      : translate(option.label)}
                  </span>
                </>
              );
            })()
          ) : kind === "fit" ? (
            <>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="1" />
                {option.value === "cover" ? (
                  <path d="m3 17 6-7 5 5 3-4 4 6M3 7h18" />
                ) : (
                  <rect
                    x="5"
                    y="7"
                    width="14"
                    height="10"
                    rx="1"
                    fill="currentColor"
                    opacity="0.4"
                  />
                )}
              </svg>
              <span>
                {translate(option.value === "cover" ? "Crop" : "Fit")}
              </span>
            </>
          ) : kind === "crop" ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" opacity="0.4" />
              <circle
                cx={anchors[option.value][0]}
                cy={anchors[option.value][1]}
                r="2.3"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          ) : kind === "appearance" ? (
            option.value === "link" ? (
              <span aria-hidden="true" className="choice-text">
                Aa
              </span>
            ) : (
              <span
                aria-hidden="true"
                className={`choice-pill choice-pill-${option.value}`}
              />
            )
          ) : kind === "size" || kind === "text-size" ? (
            (() => {
              const text = translate(option.label);
              const parts = /^(.*) \((\d+px)\)$/.exec(text);
              const sizeLabel =
                kind === "text-size"
                  ? {
                      default: translate("Default"),
                      small: "S",
                      medium: "M",
                      large: "L",
                      display: "XL",
                      custom: translate("Custom"),
                    }[option.value]
                  : undefined;
              return parts ? (
                <>
                  <span>{sizeLabel ?? parts[1]}</span>
                  <span className="choice-unit">{parts[2]}</span>
                </>
              ) : (
                (sizeLabel ?? text)
              );
            })()
          ) : kind === "heading" ? (
            option.label
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              {["top", "middle", "bottom"].includes(option.value) ? (
                <>
                  <rect
                    x="3"
                    y="2"
                    width="18"
                    height="20"
                    rx="2"
                    opacity="0.35"
                  />
                  <rect
                    x="6"
                    y={{ top: 5, middle: 10, bottom: 15 }[option.value]}
                    width="12"
                    height="4"
                    rx="0.75"
                    fill="currentColor"
                    stroke="none"
                  />
                </>
              ) : (
                <path d={paths[option.value]} />
              )}
            </svg>
          )}
        </button>
      ))}
    </Group>
  );
};
