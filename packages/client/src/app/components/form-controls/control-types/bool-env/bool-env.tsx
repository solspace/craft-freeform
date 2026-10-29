import { Dropdown } from "@components/elements/custom-dropdown/dropdown";
import { useRenderContext } from "@components/form-controls/context/render.context";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import { useCodeblockText } from "@ff-client/hooks/use-codeblock-text";
import { useAutosuggestEnvVariables } from "@ff-client/queries/autosuggest";
import type { BooleanEnvProperty } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import type { ReactNode } from "react";
import styled from "styled-components";
import { useEnvOptions } from "./bool-env.options";
import { EnvLine } from "./env.line";

const translationString =
  "This can be set to an environment variable with a boolean value (`yes`/`no`/`true`/`false`/`on`/`off`/`0`/`1`).";

const MenuWidth = styled.div<{ $compact: boolean }>`
  width: ${({ $compact }) => ($compact ? "100%" : "50%")};
  min-width: min(100%, 280px);
  max-width: 100%;
  @media (max-width: 900px) { width: 100%; }
`;

const BoolEnv = ({
  value,
  updateValue,
  property,
  errors,
  context,
}: ControlType<BooleanEnvProperty>): ReactNode => {
  const translated = translate(translationString);
  const codeblock = useCodeblockText(translated);
  const { size } = useRenderContext();

  const { data, isFetching } = useAutosuggestEnvVariables();
  const options = useEnvOptions();

  if (["", "0", "no", "off"].includes(String(value).toLowerCase())) {
    value = "false";
  } else if (["1", "yes", "on"].includes(String(value).toLowerCase())) {
    value = "true";
  }

  return (
    <Control property={property} errors={errors} context={context}>
      <MenuWidth $compact={size === "small"}>
        <Dropdown
          value={value}
          options={options}
          onChange={(val) => updateValue(val)}
          loading={isFetching && !data}
          showSelectedIcon
          showHints
        />
      </MenuWidth>
      <EnvLine>{codeblock}</EnvLine>
    </Control>
  );
};

export default BoolEnv;
