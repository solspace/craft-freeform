import { ButtonGroup } from "@components/elements/button-group/button-group";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import type { ButtonGroupProperty } from "@ff-client/types/properties";
import type React from "react";

const DateTimeIcon = ({ value }: { value: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {value === "time" ? (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ) : value === "date" ? (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 11h18M7 15h3M7 18h7" />
      </>
    ) : (
      <>
        <path d="M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3M16 1v4M8 1v4M3 9h5" />
        <circle cx="16" cy="16" r="6" />
        <path d="M16 13v3l2 1.5" />
      </>
    )}
  </svg>
);

const BannerStyleIcon = ({ value }: { value: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {value === "bold" ? (
      <path
        fill="currentColor"
        fillRule="evenodd"
        stroke="none"
        d="M6 4h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Zm1 5v2h10V9H7Zm0 4v2h7v-2H7Z"
      />
    ) : (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" strokeDasharray="2 2" />
        <path d="M7 10h10M7 14h7" />
      </>
    )}
  </svg>
);

const ButtonGroupField: React.FC<ControlType<ButtonGroupProperty>> = ({
  value,
  property,
  errors,
  context,
  updateValue,
}) => {
  const { options } = property;
  const dateTimeType = property.handle === "dateTimeType";

  return (
    <Control property={property} errors={errors} context={context}>
      <ButtonGroup
        label={property.label}
        flush
        value={value}
        options={options}
        stacked={dateTimeType}
        compact={
          property.handle === "submissionLimitPeriod" ? false : undefined
        }
        renderIcon={
          dateTimeType
            ? (type) => <DateTimeIcon value={type} />
            : property.handle === "bannerStyle"
              ? (type) => <BannerStyleIcon value={type} />
              : undefined
        }
        onClick={(value) => updateValue(value)}
      />
    </Control>
  );
};

export default ButtonGroupField;
