import React from 'react';
import { HelpText } from '@components/elements/help-text';
import {
  type FieldMapping,
  TargetFieldType,
} from '@ff-client/types/integrations';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import CustomIcon from './icons/custom.svg';
import RelationIcon from './icons/relation.svg';
import { FieldSelect } from './field-select';
import {
  MappingWrapper,
  SourceField,
  TypeButton,
  TypeButtonGroup,
} from './mapping.styles';
import type { SourceField as SourceFieldType } from './mapping.types';

type Props = {
  sources: SourceFieldType[];
  mapping?: FieldMapping;
  updateValue: (value: FieldMapping) => void;
};

export const FieldMappingController: React.FC<Props> = ({
  sources,
  mapping,
  updateValue,
}) => {
  if (!mapping) {
    return null;
  }

  return (
    <div>
      {sources.length === 0 && (
        <HelpText>{translate('No data present')}</HelpText>
      )}
      {sources.map((source) => {
        const map = mapping[source.id] ?? {
          type: TargetFieldType.Relation,
          value: '',
        };

        return (
          <MappingWrapper key={source.id}>
            <SourceField className={classes(source.required && 'required')}>
              <span>{source.label}</span>
            </SourceField>

            <TypeButtonGroup>
              <TypeButton
                title={translate('Custom template')}
                className={classes(
                  map.type === TargetFieldType.Custom && 'active'
                )}
                onClick={() =>
                  updateValue({
                    ...mapping,
                    [source.id]: {
                      type: TargetFieldType.Custom,
                      value: '',
                    },
                  })
                }
              >
                <CustomIcon />
              </TypeButton>
              <TypeButton
                title={translate('Relationship')}
                className={classes(
                  map.type === TargetFieldType.Relation && 'active'
                )}
                onClick={() =>
                  updateValue({
                    ...mapping,
                    [source.id]: {
                      type: TargetFieldType.Relation,
                      value: '',
                    },
                  })
                }
              >
                <RelationIcon />
              </TypeButton>
            </TypeButtonGroup>

            <div>
              {map.type === TargetFieldType.Relation && (
                <FieldSelect
                  value={map?.value}
                  onChange={(fieldUid) => {
                    updateValue({
                      ...mapping,
                      [source.id]: {
                        ...map,
                        value: fieldUid,
                      },
                    });
                  }}
                />
              )}

              {map.type === TargetFieldType.Custom && (
                <input
                  type="text"
                  className="text fullwidth code"
                  value={map.value}
                  onChange={(event) => {
                    updateValue({
                      ...mapping,
                      [source.id]: {
                        ...map,
                        value: event.target.value,
                      },
                    });
                  }}
                />
              )}
            </div>
          </MappingWrapper>
        );
      })}
    </div>
  );
};
