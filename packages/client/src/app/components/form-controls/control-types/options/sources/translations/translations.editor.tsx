import React, { useRef } from 'react';
import { LightSwitch } from '@components/elements/lightswitch/lightswitch';
import {
  Cell,
  Input,
  Row,
  TableContainer,
  TabularOptions,
} from '@components/form-controls/control-types/table/table.editor.styles';
import { useCellNavigation } from '@components/form-controls/hooks/use-cell-navigation';
import { PreviewEditor } from '@components/form-controls/preview/previewable-component.styles';
import type { Field } from '@editor/store/slices/layout/fields';
import { useTranslations } from '@editor/store/slices/translations/translations.hooks';
import type { Property } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';
import { cloneDeep } from 'lodash';

import type { Option, OptionsConfiguration } from '../../options.types';

import { OriginalValuePreview } from './translations.editor.styles';
import type { OptionTranslations } from './translations.types';

type Props = {
  value: OptionsConfiguration;
  defaultValue: string | string[];
  isMultiple: boolean;
  field: Field;
  property: Property;
};

export const OptionsTranslationsEditor: React.FC<Props> = ({
  value,
  defaultValue,
  isMultiple,
  property,
  field,
}) => {
  const { getTranslation, updateTranslation } = useTranslations(field);
  const options = (value.source === 'custom' && value.options) || [];

  const translation = getTranslation<OptionTranslations>(property.handle, {});
  const optionTranslations: Option[] = translation.options || [];
  const defaultValueTranslations: string | string[] =
    translation.defaultValue || defaultValue;

  const refs = useRef([]);
  refs.current = options.map(
    (_, index) => refs.current[index] || React.createRef<HTMLButtonElement>()
  );

  const { activeCell, setActiveCell, setCellRef, keyPressHandler } =
    useCellNavigation(options.length, 1);

  return (
    <PreviewEditor>
      <TableContainer>
        <TabularOptions>
          <tbody>
            {options.map((option, index) => {
              const optTranslation = optionTranslations.find(
                (opt) => opt.value === option.value
              );

              let isChecked = false;
              if (defaultValueTranslations === undefined) {
                if (isMultiple) {
                  isChecked = defaultValue.includes(option.value);
                } else {
                  isChecked = defaultValue === option.value;
                }
              } else {
                if (isMultiple) {
                  isChecked = defaultValueTranslations.includes(option.value);
                } else {
                  isChecked = defaultValueTranslations === option.value;
                }
              }

              const label =
                optTranslation !== undefined
                  ? optTranslation.label
                  : option.label;

              return (
                <Row key={index}>
                  <Cell style={{ width: 200 }}>
                    <OriginalValuePreview className="code" title={option.value}>
                      {option.value || translate('Empty')}
                    </OriginalValuePreview>
                  </Cell>

                  <Cell>
                    <Input
                      type="text"
                      value={label}
                      placeholder={translate('Label')}
                      autoFocus={activeCell === `${index}:0`}
                      ref={(element) => setCellRef(element, index, 0)}
                      onFocus={() => setActiveCell(index, 0)}
                      onKeyDown={keyPressHandler()}
                      onChange={(event) => {
                        const updatedOptions = cloneDeep(optionTranslations);
                        const translationIndex = updatedOptions.findIndex(
                          (opt) => opt.value === option.value
                        );

                        if (translationIndex === -1) {
                          updatedOptions.push({
                            value: option.value,
                            label: event.target.value,
                          });
                        } else {
                          updatedOptions[translationIndex].label =
                            event.target.value;
                        }

                        updateTranslation(property.handle, {
                          ...translation,
                          options: updatedOptions,
                        });
                      }}
                    />
                  </Cell>

                  <Cell $tiny>
                    <LightSwitch
                      enabled={isChecked}
                      onClick={(value) => {
                        if (!isMultiple) {
                          updateTranslation(property.handle, {
                            ...translation,
                            defaultValue: value ? option.value : '',
                          });

                          return;
                        }

                        let updatedValues: string[];
                        if (typeof defaultValueTranslations === 'object') {
                          updatedValues = [...defaultValueTranslations];
                        } else {
                          updatedValues = [];
                        }

                        if (value && !updatedValues.includes(option.value)) {
                          updatedValues.push(option.value);
                        } else if (
                          !value &&
                          updatedValues.includes(option.value)
                        ) {
                          updatedValues.splice(
                            updatedValues.indexOf(option.value),
                            1
                          );
                        }

                        updateTranslation(property.handle, {
                          ...translation,
                          defaultValue: updatedValues,
                        });
                      }}
                    />
                  </Cell>
                </Row>
              );
            })}
          </tbody>
        </TabularOptions>
      </TableContainer>
    </PreviewEditor>
  );
};
