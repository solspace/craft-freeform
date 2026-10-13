import bootstrap from "@ff-client/assets/icons/formatting-templates/bootstrap.svg";
import daisyui from "@ff-client/assets/icons/formatting-templates/daisyui.svg";
import foundation from "@ff-client/assets/icons/formatting-templates/foundation.svg";
import freeform from "@ff-client/assets/icons/formatting-templates/freeform.svg";
import tailwind from "@ff-client/assets/icons/formatting-templates/tailwind.svg";
import type { OptionCollection } from "@ff-client/types/properties";
import type { ReactNode } from "react";

const logo = (src: string) => (
  <img
    src={src}
    alt=""
    aria-hidden="true"
    width={16}
    height={16}
    style={{ display: "block", objectFit: "contain" }}
  />
);
const flexbox = (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect
      x="2"
      y="4"
      width="20"
      height="16"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect x="5" y="7" width="3" height="10" rx="1" fill="currentColor" />
    <rect x="10" y="7" width="5" height="10" rx="1" fill="currentColor" />
    <rect x="17" y="7" width="2" height="10" rx="1" fill="currentColor" />
  </svg>
);
const grid = (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    fill="currentColor"
  >
    {[3, 10, 17].flatMap((x) =>
      [3, 10, 17].map((y) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" rx="1" />
      )),
    )}
  </svg>
);
const sampleIcons: Record<string, ReactNode> = {
  "basic-dark/index.twig": logo(freeform),
  "basic-light/index.twig": logo(freeform),
  "basic-floating-labels/index.twig": logo(freeform),
  "conversational/index.twig": logo(freeform),
  "multipage-all-fields/index.twig": logo(freeform),
  "bootstrap-5/index.twig": logo(bootstrap),
  "bootstrap-5-dark/index.twig": logo(bootstrap),
  "bootstrap-5-floating-labels/index.twig": logo(bootstrap),
  "tailwind-3/index.twig": logo(tailwind),
  "tailwind-3-dark/index.twig": logo(tailwind),
  "tailwind-4-light/index.twig": logo(tailwind),
  "tailwind-4-dark/index.twig": logo(tailwind),
  "daisyui-5-light/index.twig": logo(daisyui),
  "daisyui-5-dark/index.twig": logo(daisyui),
  "foundation-6/index.twig": logo(foundation),
  "flexbox/index.twig": flexbox,
  "grid/index.twig": grid,
};

/** Add presentation metadata without changing labels, values, groups, or custom templates. */
export const addSelectOptionIcons = (
  handle: string,
  options?: OptionCollection,
): OptionCollection | undefined => {
  if (handle === "formattingTemplate") {
    return options?.map((group) => {
      if (!("children" in group) || group.label !== "Solspace") return group;
      return {
        ...group,
        children: group.children.map((option) =>
          "value" in option && sampleIcons[option.value]
            ? { ...option, icon: sampleIcons[option.value] }
            : option,
        ),
      };
    });
  }
  if (handle === "defaultStatus") {
    return options?.map((option) => {
      if (!("value" in option) || !option.color) return option;
      return {
        ...option,
        icon: (
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <circle cx="8" cy="8" r="5" fill={option.color} />
          </svg>
        ),
      };
    });
  }
  return options;
};
