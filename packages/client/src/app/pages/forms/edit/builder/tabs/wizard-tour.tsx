import config from "@config/freeform/freeform.config";
import { useEscapeStack } from "@ff-client/contexts/escape/escape.context";
import translate from "@ff-client/utils/translations";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

const TourCard = styled.section`
  position: fixed; z-index: 1102; bottom: 30px; right: 30px; width: min(350px, calc(100vw - 40px)); box-sizing: border-box;
  padding: 24px; background: #fff; border: 1px solid #c8d9eb; border-radius: 9px; box-shadow: 0 12px 55px #233e6650; color: #3f4d5a;
  h2 { font-size: 18px; margin: 6px 0 10px; } p { font-size: 13px; line-height: 1.6; margin: 0 0 20px; }
  .tour-progress { color: #6d839a; font-size: 11px; }
  footer { display: flex; align-items: center; gap: 8px; }
  footer > :last-child { margin-left: auto; }
  animation: tour-in .25s ease both;
  @keyframes tour-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
const Spotlight = styled.div`
  position: fixed; z-index: 1101; border: 2px solid #77b3ee; border-radius: 6px; pointer-events: none; box-sizing: border-box;
`;

export function WizardTour({ formId }: { formId: number }) {
  const location = useLocation();
  const navigate = useNavigate();
  const active = new URLSearchParams(location.search).get("wizardTour") === "1";
  const [index, setIndex] = useState(0);
  const [bounds, setBounds] = useState<DOMRect[]>([]);
  const maskId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const prefix = `/forms/${formId}`;
  const steps = [
    {
      title: translate("Your form layout"),
      text: translate(
        "These are your form fields. Select a field to edit its settings, or drag fields to rearrange your layout.",
      ),
      path: prefix,
      selector: '[data-wizard-tour="canvas"]',
    },
    {
      title: translate("Add more fields"),
      text: translate(
        "Drag a field from this panel into your form. Available field types follow your Freeform edition and permissions.",
      ),
      path: prefix,
      selector: '[data-wizard-tour="fields"]',
    },
    ...(config.limitations.can("notifications.tab")
      ? [
          {
            title: translate("Email notifications"),
            text: translate(
              "Manage team notifications and visitor confirmations here. Check your recipients and email templates before publishing.",
            ),
            path: `${prefix}/notifications`,
            selector:
              '[data-wizard-tour="tabs"], [data-wizard-tour="notifications"]',
          },
        ]
      : []),
    ...(config.limitations.can("settings.tab")
      ? [
          {
            title: translate("Form settings"),
            text: translate(
              "Change your formatting template, submission behavior, storage settings, and find embedding options here.",
            ),
            path: `${prefix}/settings`,
            selector:
              '[data-wizard-tour="tabs"], [data-wizard-tour="settings"]',
          },
        ]
      : []),
    {
      title: translate("Try your form"),
      text: translate(
        "Preview the saved form here. Submissions, payments, and uploads are disabled in Preview. Save builder changes before refreshing it.",
      ),
      path: `${prefix}/preview`,
      selector: '[data-wizard-tour="tabs"], [data-wizard-tour="preview"]',
    },
  ];
  const step = steps[Math.min(index, steps.length - 1)];
  const close = () => {
    const query = new URLSearchParams(location.search);
    query.delete("wizardTour");
    navigate(
      { pathname: location.pathname, search: query.toString() },
      { replace: true },
    );
  };
  useEscapeStack(close, active);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Adjacent steps may spotlight the same element but still need a fresh focus/measurement.
  useEffect(() => {
    if (!active) return;
    heading.current?.focus();
    const measure = () => {
      const next = Array.from(document.querySelectorAll(step.selector))
        .map((element) => element.getBoundingClientRect())
        .filter((rect) => rect.width > 0 && rect.height > 0);
      setBounds((previous) =>
        previous.length === next.length &&
        previous.every((rect, index) =>
          (["top", "left", "width", "height"] as const).every(
            (key) => rect[key] === next[index][key],
          ),
        )
          ? previous
          : next,
      );
    };
    measure();
    const observer = new MutationObserver(measure);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, step.selector, index]);
  if (!active) return null;
  const go = (next: number) => {
    setIndex(next);
    navigate(`${steps[next].path}?wizardTour=1`, { replace: true });
  };
  return createPortal(
    <>
      <svg
        aria-hidden="true"
        width="100%"
        height="100%"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1100,
          pointerEvents: "none",
        }}
      >
        <defs>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="100%"
            height="100%"
          >
            <rect width="100%" height="100%" fill="white" />
            {bounds.map((rect, index) => (
              <rect
                key={index}
                x={Math.max(0, rect.left - 4)}
                y={Math.max(0, rect.top - 4)}
                width={rect.width + 8}
                height={rect.height + 8}
                rx="6"
                fill="black"
              />
            ))}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="#203a592b"
          mask={`url(#${maskId})`}
        />
      </svg>
      {bounds.map((rect, index) => (
        <Spotlight
          key={index}
          data-wizard-spotlight
          style={{
            top: Math.max(0, rect.top - 4),
            left: Math.max(0, rect.left - 4),
            width: rect.width + 8,
            height: rect.height + 8,
          }}
          aria-hidden="true"
        />
      ))}
      <TourCard role="dialog" aria-label={translate("Builder walkthrough")}>
        <span className="tour-progress">
          {translate("Step {step} of {count}", {
            step: index + 1,
            count: steps.length,
          })}
        </span>
        <h2 ref={heading} tabIndex={-1}>
          {step.title}
        </h2>
        <p>{step.text}</p>
        <footer>
          <button type="button" className="btn" onClick={close}>
            {translate("End tour")}
          </button>
          {index > 0 && (
            <button type="button" className="btn" onClick={() => go(index - 1)}>
              {translate("Back")}
            </button>
          )}
          <button
            type="button"
            className="btn submit"
            onClick={() =>
              index === steps.length - 1 ? close() : go(index + 1)
            }
          >
            {translate(index === steps.length - 1 ? "Done" : "Next")}
          </button>
        </footer>
      </TourCard>
    </>,
    document.body,
  );
}
