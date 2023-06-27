import React from 'react';
import {
  ControlWrapper,
  FormField,
} from '@components/form-controls/control.styles';
import { CheckboxWrapper } from '@components/form-controls/control-types/bool/bool.styles';
import FormLabel from '@components/form-controls/label';
import type { ControlType } from '@components/form-controls/types';
import type { PageButtonProperty } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import { PageButtonWrapper } from './page-button.styles';

const PageButton: React.FC<ControlType<PageButtonProperty>> = ({
  value,
  property,
  updateValue,
}) => {
  return (
    <>
      <ControlWrapper>
        <PageButtonWrapper>
          <CheckboxWrapper>
            {property.togglable && (
              <input
                id={property.handle}
                type="checkbox"
                checked={value.enabled}
                className="checkbox"
                onChange={() =>
                  updateValue({ ...value, enabled: !value.enabled })
                }
              />
            )}

            <FormLabel
              label={property.label}
              handle={property.handle}
              required={property.required}
              title={property.instructions}
            />
          </CheckboxWrapper>
        </PageButtonWrapper>

        {(!property.togglable || value.enabled) && (
          <FormField>
            <input
              type="text"
              className={classes('text', 'fullwidth')}
              placeholder={translate('Label')}
              value={value.label ?? ''}
              onChange={(event) =>
                updateValue({ ...value, label: event.target.value })
              }
            />
          </FormField>
        )}
      </ControlWrapper>
    </>
  );
};

export default PageButton;
