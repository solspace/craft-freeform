import { ButtonGroup } from "@components/elements/button-group/button-group";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import { type Property, PropertyType } from "@ff-client/types/properties";
import freeformIcon from "../../../../../../plugin/src/icon-mask.svg";

function Icon({ handle, value }: { handle: string; value: string }) {
  if (handle === "frontendMode" && value === "managed") {
    return (
      <span
        aria-hidden="true"
        style={{
          display: "block",
          width: 14,
          height: 14,
          backgroundColor: "currentColor",
          mask: `url("${freeformIcon}") center / contain no-repeat`,
          WebkitMask: `url("${freeformIcon}") center / contain no-repeat`,
        }}
      />
    );
  }
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {handle === "theme" ? (
        value === "auto" ? (
          <>
            <rect x="3" y="4" width="18" height="13" rx="2" />
            <path d="M8 21h8m-4-4v4" />
          </>
        ) : value === "light" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
          </>
        ) : (
          <path d="M20 14a8.5 8.5 0 0 1-10-10 8.5 8.5 0 1 0 10 10Z" />
        )
      ) : handle === "frontendMode" ? (
        <path d="m8 6-6 6 6 6m8-12 6 6-6 6M14.5 4l-5 16" />
      ) : handle === "scriptDomain" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a18 18 0 0 1 0 18 18 18 0 0 1 0-18Z" />
        </>
      ) : handle === "failureBehavior" ? (
        value === "send-to-spam" ? (
          <>
            <path d="M3 7V5a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
            <path d="M12 10v4m0 3h.01" />
          </>
        ) : (
          <>
            <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
            <path d="M12 7v4m0 3h.01" />
          </>
        )
      ) : value === "compact" ? (
        <rect x="6" y="3" width="12" height="18" rx="2" />
      ) : value === "flexible" ? (
        <>
          <path d="M2 12h20M6 8l-4 4 4 4m12-8 4 4-4 4" />
          <path d="M8 4h8M8 20h8" />
        </>
      ) : (
        <rect x="3" y="6" width="18" height="12" rx="2" />
      )}
    </svg>
  );
}

export function CaptchaButtons({
  property,
  value,
  errors,
  context,
  updateValue,
}: ControlType<Property>) {
  if (property.type !== PropertyType.ButtonGroup) return null;
  return (
    <Control property={property} errors={errors} context={context}>
      <ButtonGroup
        label={property.label}
        value={typeof value === "string" ? value : ""}
        options={property.options}
        onClick={updateValue}
        renderIcon={(value) => <Icon handle={property.handle} value={value} />}
      />
    </Control>
  );
}
