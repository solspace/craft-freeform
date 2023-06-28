import React from 'react';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type { PageButtonsLayoutProperty } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

const PageButtonLayout: React.FC<ControlType<PageButtonsLayoutProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  return (
    <Control property={property} errors={errors}>
      <div className="select fullwidth">
        <select
          value={value}
          onChange={(event) => updateValue(event.target.value)}
        >
          <option value="back|submit|save">{translate('Left')}</option>
          <option value="save|back|submit">
            {translate('Left (save on left)')}
          </option>
          <option value=" back|submit|save">{translate('Right')}</option>
          <option value=" save|back|submit">
            {translate('Right (save on left)')}
          </option>
          <option value=" save|back|submit ">
            {translate('Center (save on left)')}
          </option>
          <option value=" back|submit|save ">
            {translate('Center (save on right)')}
          </option>
          <option value="back|submit save">{translate('Save on right')}</option>
          <option value="save back|submit">{translate('Save on left')}</option>
        </select>
      </div>
    </Control>
  );
};

export default PageButtonLayout;
