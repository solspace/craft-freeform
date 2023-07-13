import React from 'react';
import { HelpText } from '@components/elements/help-text';
import {
  type FieldMapping,
  TargetFieldType,
} from '@ff-client/types/integrations';
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

type Props = {
  sources: Record<string, string>;
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
      {Object.entries(sources).length === 0 && (
        <HelpText>{translate('No data present')}</HelpText>
      )}
      {Object.entries(sources).map(([key, value]) => {
        const map = mapping[key] ?? {
          type: TargetFieldType.Relation,
          value: '',
        };

        return (
          <MappingWrapper key={key}>
            <SourceField>
              <span>{value}</span>
            </SourceField>

            <TypeButtonGroup>
              <TypeButton
                title={translate('Relationship')}
                $active={map.type === TargetFieldType.Relation}
                onClick={() =>
                  updateValue({
                    ...mapping,
                    [key]: {
                      type: TargetFieldType.Relation,
                      value: '',
                    },
                  })
                }
              >
                <RelationIcon />
              </TypeButton>
              <TypeButton
                title={translate('Custom template')}
                $active={map.type === TargetFieldType.Custom}
                onClick={() =>
                  updateValue({
                    ...mapping,
                    [key]: {
                      type: TargetFieldType.Custom,
                      value: '',
                    },
                  })
                }
              >
                <CustomIcon />
              </TypeButton>
            </TypeButtonGroup>

            <div>
              {map.type === TargetFieldType.Relation && (
                <FieldSelect
                  value={map?.value}
                  onChange={(fieldUid) => {
                    updateValue({
                      ...mapping,
                      [key]: {
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
                      [key]: {
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
