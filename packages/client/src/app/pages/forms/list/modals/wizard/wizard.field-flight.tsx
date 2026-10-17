import type { FieldType } from "@ff-client/types/fields";
import translate from "@ff-client/utils/translations";
import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import { visibleBuilderPoint } from "./wizard.builder-pointer";
import type { WizardField } from "./wizard.types";

export function WizardFieldFlight({
  field,
  types,
  stage,
}: {
  field?: WizardField;
  types: FieldType[];
  stage: RefObject<HTMLDivElement | null>;
}) {
  const ghost = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!field || !stage.current || !ghost.current) return;
    let animations: Animation[] = [];
    let target: Element | null = null;
    const frame = requestAnimationFrame(() => {
      const root = stage.current;
      const card = ghost.current;
      if (!root || !card) return;
      const type = types.find((type) => type.type === field.type);
      const source = Array.from(
        root.querySelectorAll<HTMLElement>(
          '[data-wizard-tour="fields"] [title]',
        ),
      ).find((element) => element.title === translate(type?.name || ""));
      target = root.querySelector(
        `[data-field-uid="wizard-field-${CSS.escape(field.key)}"]`,
      );
      if (!source || !target || typeof card.animate !== "function") return;
      source.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "instant",
      });
      target.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "instant",
      });
      const from = source.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const modal = root.parentElement
        ?.querySelector('[role="dialog"]')
        ?.getBoundingClientRect();
      const canvas = target
        .closest('[data-builder-target="canvas"]')
        ?.getBoundingClientRect();
      const exposed =
        modal &&
        visibleBuilderPoint(
          to,
          modal,
          window.innerWidth,
          window.innerHeight,
          canvas,
        );
      const end = exposed || { x: to.left + 12, y: to.top + 12 };
      const start = { x: from.left + 12, y: from.top + 10 };
      target.setAttribute("data-builder-highlight", "");
      animations = [
        card.animate(
          [
            { transform: `translate(${start.x}px, ${start.y}px)`, opacity: 0 },
            {
              transform: `translate(${start.x}px, ${start.y}px)`,
              opacity: 1,
              offset: 0.1,
            },
            {
              transform: `translate(${(start.x + end.x) / 2}px, ${(start.y + end.y) / 2 - 24}px)`,
              opacity: 1,
              offset: 0.5,
            },
            {
              transform: `translate(${end.x}px, ${end.y}px)`,
              opacity: 1,
              offset: 0.85,
            },
            { transform: `translate(${end.x}px, ${end.y}px)`, opacity: 0 },
          ],
          { duration: 660, easing: "ease-in-out", fill: "forwards" },
        ),
        target.animate(
          [{ opacity: 0 }, { opacity: 0, offset: 0.75 }, { opacity: 1 }],
          { duration: 660 },
        ),
      ];
    });
    return () => {
      cancelAnimationFrame(frame);
      animations.forEach((animation) => {
        animation.cancel();
      });
      target?.removeAttribute("data-builder-highlight");
    };
  }, [field, types, stage]);
  return (
    <div ref={ghost} className="builder-field-flight">
      <svg viewBox="0 0 28 34" fill="none" aria-hidden="true">
        <path
          d="M3 2v25l7-7 6 11 5-3-6-10h10L3 2Z"
          fill="#3478b9"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <span>{field?.label}</span>
    </div>
  );
}
