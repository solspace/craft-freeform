import React from 'react';
import { CustomOptions } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options-editor';
import type { CustomOptionsProps } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options-editor/custom-options';

import { Column, Heading, Row, Wrapper } from './options-editor.styles';

type OptionsEditorProps = {
  source: string;
  customOptions?: CustomOptionsProps;
  // TODO - Implement other source types for Entries, Users, Predefined etc
};

type Props = {
  handle: string;
  value: OptionsEditorProps;
  onChange?: (value: OptionsEditorProps) => void;
};

export const OptionsEditor: React.FC<Props> = ({ handle, value, onChange }) => {
  return (
    <Wrapper>
      <Row>
        <Column>
          <Heading>Source</Heading>
          <select
            id="source"
            defaultValue={(value.source as string) || ''}
            className="text fullwidth"
            onChange={(event) =>
              onChange &&
              onChange({
                ...value,
                source: event.target.value,
              })
            }
          >
            <option value=""></option>
            <option value="customOptions">Custom Options</option>
          </select>
        </Column>
      </Row>
      {value.source == 'customOptions' && (
        <CustomOptions
          handle={handle}
          value={(value.customOptions as CustomOptionsProps) || []}
          onChange={(customOptions) =>
            onChange &&
            onChange({
              ...value,
              customOptions,
            })
          }
        />
      )}
      {/* TODO - Implement other source types */}
    </Wrapper>
  );
};
