import { Label } from "@components/form-controls/label.styles";
import { OptionsHeading } from "@editor/builder/sample-data/sample-data.styles";
import type { Field } from "@editor/store/slices/layout/fields";
import type { OptionsProperty } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import type React from "react";

import type { OptionsConfiguration } from "../../options.types";

import { SourceCustom } from "./source.custom";
import { SourceElements } from "./source.elements";

export type TranslateOptionsProps = {
  value: OptionsConfiguration;
  defaultValue: string | string[];
  isMultiple: boolean;
  field: Field;
  property: OptionsProperty;
  context: Field;
  headerAction?: React.ReactNode;
};

export const OptionsTranslatable: React.FC<TranslateOptionsProps> = (props) => {
  const { value } = props;
  switch (value.source) {
    case "custom":
      return <SourceCustom {...props} />;

    case "elements":
      return (
        <>
          <OptionsHeading>
            <Label>{translate("Options")}</Label>
            {props.headerAction}
          </OptionsHeading>
          <SourceElements {...props} />
        </>
      );

    default:
      return null;
  }
};
