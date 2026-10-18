import { Tooltip } from "@components/elements/tooltip/tooltip";
import { FormErrorList } from "@components/form-controls/error-list";
import type { ControlType } from "@components/form-controls/types";
import type { Property } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import { DiceIcon } from "./dice-icon";
import { OptionSampleToggle } from "./sample-data.styles";

export const SampleDataOptions = ({
  property,
  value,
  updateValue,
  errors,
}: ControlType<Property>) => {
  const enabled = value === true;
  const readOnly =
    property.disabled ||
    property.flags?.includes("readonly") ||
    property.flags?.includes("as-readonly-in-instance");
  const instructions = translate(property.instructions ?? "");

  return (
    <>
      <Tooltip title={instructions}>
        <OptionSampleToggle
          type="button"
          aria-label={translate("Sample data")}
          aria-pressed={enabled}
          aria-description={instructions}
          disabled={readOnly}
          onClick={() => updateValue(!enabled)}
        >
          <DiceIcon solid={enabled} />
        </OptionSampleToggle>
      </Tooltip>
      <FormErrorList errors={errors} />
    </>
  );
};
