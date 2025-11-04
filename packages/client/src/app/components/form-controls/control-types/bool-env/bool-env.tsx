import React from 'react';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import { useCodeblockText } from '@ff-client/hooks/use-codeblock-text';
import { useAutosuggestEnvVariables } from '@ff-client/queries/autosuggest';
import type { BooleanEnvProperty } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

import { useEnvOptions } from './bool-env.options';
import { EnvLine } from './env.line';

const translationString =
  'This can be set to an environment variable with a boolean value (`yes`/`no`/`true`/`false`/`on`/`off`/`0`/`1`).';

const BoolEnv = ({
  value,
  updateValue,
  property,
  errors,
  context,
}: ControlType<BooleanEnvProperty>): JSX.Element => {
  const translated = translate(translationString);
  const codeblock = useCodeblockText(translated);

  const { data, isFetching } = useAutosuggestEnvVariables();
  const options = useEnvOptions();

  return (
    <Control property={property} errors={errors} context={context}>
      <Dropdown
        value={value}
        options={options}
        onChange={(val) => updateValue(val)}
        loading={isFetching && !data}
        showSelectedIcon
        showHints
      />
      <EnvLine>{codeblock}</EnvLine>
    </Control>
  );
};

export default BoolEnv;
